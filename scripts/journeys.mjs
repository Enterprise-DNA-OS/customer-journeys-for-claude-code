import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {page,table,writeOut} from './lib/render.mjs';

export const reports={
 journeys:'select * from journey_health order by code',
 steps:'select s.id,j.code as journey,s.position,s.name,s.channel,s.customer_action,s.pain,s.owner,s.revision from steps s join journeys j on j.id=s.journey_id order by j.code,s.position,s.id',
 evidence:'select code,journey,step,summary,source,observed_on,review_due,current from evidence_health order by code',
 opportunities:'select * from priority_queue order by code',
 attention:'select * from attention_queue order by kind,reference,reason',
 'evidence-gaps':"select j.code as journey,s.name as step,s.owner,s.revision from steps s join journeys j on j.id=s.journey_id where not exists(select 1 from evidence_health e where e.step_id=s.id and e.current) order by j.code,s.position",
 priorities:"select code,name,owner,priority_score,current_evidence,state from priority_queue where state in ('proposed','approved') order by priority_score desc,code",
 'owner-load':"select coalesce(nullif(owner,''),'Unassigned') as owner,count(*)::int as open_actions,count(*) filter(where due_on<current_date)::int as overdue from opportunities where state in ('proposed','approved') group by owner order by overdue desc,owner",
 outcomes:`select o.code,m.name,m.unit,count(*)::int as readings,min(m.observed_on) as first_date,max(m.observed_on) as last_date,
 (array_agg(m.value order by m.observed_on,m.created_at,m.id))[1] as first_value,
 (array_agg(m.value order by m.observed_on desc,m.created_at desc,m.id desc))[1] as last_value
 from metrics m join opportunities o on o.id=m.opportunity_id group by o.code,m.name,m.unit order by o.code,m.name,m.unit`,
 compliance:'select * from compliance_checks order by rule,reference',
 activity:'select entity,record_id,action,actor,at,before_data,after_data from audit_log order by at desc,id limit 100'
};
const mutations=['add-journey','add-step','update-step','add-evidence','review-evidence','add-opportunity','log-metric','decide','close-opportunity','review-journey','import'];
export const commands=[...Object.keys(reports),'weekly-review',...mutations,'export','draft-review','draft-brief','help'];
const tables=['journeys','steps','evidence','opportunities','metrics','audit_log'];
const requireValue=(o,k)=>{const v=o[k];if(typeof v!=='string'||!v.trim())throw Error(`--${k} is required`);return v.trim();};
function date(o,k){const v=requireValue(o,k);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`--${k} must be YYYY-MM-DD`);return v;}
function integer(o,k,min=1,max=5){const s=requireValue(o,k),v=Number(s);if(!Number.isInteger(v)||v<min||v>max)throw Error(`--${k} must be an integer from ${min} to ${max}`);return v;}
function boolean(o,k){if(o[k]===undefined)return false;if(!['true','false'].includes(o[k]))throw Error(`--${k} must be true or false`);return o[k]==='true';}
export async function resolve(db,t,ref){
 if(!tables.includes(t)||t==='audit_log')throw Error('Unknown record type');
 if(!ref)throw Error('A record reference is required');
 const name=t==='evidence'?'summary':t==='metrics'?'name':'name';
 const code=['journeys','evidence','opportunities'].includes(t)?'code':name;
 let rows=await db.query(`select * from ${t} where id::text=$1 or lower(${code})=lower($1) or lower(${name})=lower($1)`,[ref]);
 if(!rows.length)rows=await db.query(`select * from ${t} where starts_with(id::text,lower($1)) or position(lower($1) in lower(${name}))>0 order by id`,[ref]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous reference ${ref}:\n`+rows.map(x=>`${x.id} ${x.code||x.name}`).join('\n'):`No ${t} match for ${ref}`);
 return rows[0];
}
async function record(db,t,sql,params){return (await db.query(`insert into ${t} ${sql} returning *`,params))[0];}
async function write(db,c,o,pos){
 if(c==='add-journey')return record(db,'journeys','(code,name,owner,persona,goal,review_due) values($1,$2,$3,$4,$5,$6)',[requireValue(o,'code'),requireValue(o,'name'),requireValue(o,'owner'),o.persona||'',o.goal||'',date(o,'review-due')]);
 if(c==='add-step'){
  const j=await resolve(db,'journeys',requireValue(o,'journey'));
  return record(db,'steps','(journey_id,name,position,channel,customer_action,pain,owner) values($1,$2,$3,$4,$5,$6,$7)',[j.id,requireValue(o,'name'),integer(o,'position',1,100000),o.channel||'',o.action||'',o.pain||'',o.owner||j.owner]);
 }
 if(c==='update-step'){
  const s=await resolve(db,'steps',requireValue(o,'ref'));
  return (await db.query('update steps set name=$2,channel=$3,customer_action=$4,pain=$5,owner=$6 where id=$1 returning *',[s.id,o.name===undefined?s.name:requireValue(o,'name'),o.channel??s.channel,o.action??s.customer_action,o.pain??s.pain,o.owner??s.owner]))[0];
 }
 if(c==='add-evidence'){
  const s=await resolve(db,'steps',requireValue(o,'step'));const observed=date(o,'observed-on');if(observed>new Date().toISOString().slice(0,10))throw Error('Evidence cannot be dated in the future');
  return record(db,'evidence','(code,step_id,step_revision,summary,source,observed_on,review_due,purpose,personal) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[requireValue(o,'code'),s.id,s.revision,requireValue(o,'summary'),requireValue(o,'source'),observed,date(o,'review-due'),o.purpose||'',boolean(o,'personal')]);
 }
 if(c==='review-evidence'){
  const e=await resolve(db,'evidence',requireValue(o,'ref'));
  if(!['active','withdrawn'].includes(o.state))throw Error('--state must be active or withdrawn');
  requireValue(o,'note');
  // Reviewing retention never turns evidence for an old step into evidence for a new one.
  return (await db.query('update evidence set state=$2,review_due=$3,purpose=$4 where id=$1 returning *',[e.id,o.state,date(o,'review-due'),o.purpose??e.purpose]))[0];
 }
 if(c==='add-opportunity'){
  const s=await resolve(db,'steps',requireValue(o,'step'));
  return record(db,'opportunities','(code,step_id,name,owner,due_on,impact,effort) values($1,$2,$3,$4,$5,$6,$7)',[requireValue(o,'code'),s.id,requireValue(o,'name'),requireValue(o,'owner'),date(o,'due-on'),integer(o,'impact'),integer(o,'effort')]);
 }
 if(c==='log-metric'){
  const op=await resolve(db,'opportunities',requireValue(o,'ref'));const value=Number(requireValue(o,'value'));
  if(!Number.isFinite(value))throw Error('Metric value must be finite');const observed=date(o,'observed-on');if(observed>new Date().toISOString().slice(0,10))throw Error('Measurement cannot be dated in the future');
  return record(db,'metrics','(opportunity_id,name,value,unit,observed_on,source) values($1,$2,$3,$4,$5,$6)',[op.id,requireValue(o,'name'),value,requireValue(o,'unit'),observed,requireValue(o,'source')]);
 }
 if(c==='decide'){
  const op=await resolve(db,'opportunities',requireValue(o,'ref'));if(op.state==='done')throw Error('Completed decisions cannot be changed');
  if(!['approved','rejected'].includes(o.decision))throw Error('--decision must be approved or rejected');
  if(o.decision==='approved'){
   const e=await db.query('select id from evidence_health where step_id=$1 and current',[op.step_id]);
   if(!e.length)throw Error('Approval needs current evidence for this step');
  }
  return (await db.query('update opportunities set state=$2,decision_note=$3,decided_by=$4 where id=$1 returning *',[op.id,o.decision,requireValue(o,'note'),o.actor]))[0];
 }
 if(c==='close-opportunity'){
  const op=await resolve(db,'opportunities',requireValue(o,'ref'));if(op.state!=='approved')throw Error('Only approved opportunities can close');
  const measurements=await db.query('select name,unit from metrics where opportunity_id=$1 group by name,unit having count(distinct observed_on)>=2',[op.id]);
  if(!measurements.length)throw Error('Closure needs two dated measurements of the same metric and unit');
  const e=await db.query('select id from evidence_health where step_id=$1 and current',[op.step_id]);if(!e.length)throw Error('Closure needs current evidence');
  return (await db.query("update opportunities set state='done',outcome_note=$2 where id=$1 returning *",[op.id,requireValue(o,'note')]))[0];
 }
 if(c==='review-journey'){
  const j=await resolve(db,'journeys',requireValue(o,'ref'));requireValue(o,'note');
  return (await db.query('update journeys set reviewed_at=now(),review_due=$2 where id=$1 returning *',[j.id,date(o,'review-due')]))[0];
 }
 if(c==='import')return importCsv(db,o,pos);
 throw Error(`Unknown mutation ${c}`);
}
async function importCsv(db,o,pos){
 if(pos[0]!=='uxpressia')throw Error('Use import uxpressia');
 const file=requireValue(o,'file'),source=requireValue(o,'source'),journey=requireValue(o,'journey');
 const rows=parseCsv(fs.readFileSync(file,'utf8'));if(!rows.length)throw Error('No CSV data rows');
 const mapping=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
 const column=(row,key,defaults)=>{const requested=mapping[key];if(requested&&!Object.hasOwn(row,requested))throw Error(`Mapping column missing: ${requested}`);return requested?row[requested]:pick(row,...defaults);};
 const prepared=rows.map((row,i)=>{
  const name=column(row,'name',['User Stories','Step','Name']);if(!name.trim())throw Error(`Row ${i+2}: expected User Stories, Step or Name; use --map for other headers`);
  const id=column(row,'id',['ID','Id','Step ID']);
  const key=source+':'+(id||createHash('sha256').update(name.trim()).digest('hex'));
  return {key,name,action:column(row,'action',['User Stories','Customer action']),pain:column(row,'pain',['Pain points','Pain']),channel:column(row,'channel',['Channel']),row};
 });
 if(new Set(prepared.map(x=>x.key)).size!==prepared.length)throw Error('Duplicate source keys; supply unique ID values or a reviewed ID mapping');
 let j;try{j=await resolve(db,'journeys',journey);}catch(e){if(!e.message.startsWith('No journeys'))throw e;}
 if(!j)j=await record(db,'journeys','(code,name,owner) values($1,$2,$3)',[journey,o.name||journey,o.owner||'']);
 let added=0,updated=0,unchanged=0;
 let position=(await db.query('select coalesce(max(position),0)::int as n from steps where journey_id=$1',[j.id]))[0].n;
 for(const p of prepared){
  const old=(await db.query('select * from steps where journey_id=$1 and source_key=$2',[j.id,p.key]))[0];
  if(old){
   const equal=(await db.query('select source_data=$2::jsonb as same from steps where id=$1',[old.id,JSON.stringify(p.row)]))[0].same;
   if(equal&&old.name===p.name&&old.channel===p.channel&&old.customer_action===p.action&&old.pain===p.pain){unchanged++;continue;}
   if(!o.update)throw Error('Changed source row: review then use --update');
   await db.query('update steps set name=$2,channel=$3,customer_action=$4,pain=$5,source_data=$6 where id=$1',[old.id,p.name,p.channel,p.action,p.pain,JSON.stringify(p.row)]);updated++;
  }else{
   await record(db,'steps','(journey_id,name,position,channel,customer_action,pain,source_key,source_data) values($1,$2,$3,$4,$5,$6,$7,$8)',[j.id,p.name,++position,p.channel,p.action,p.pain,p.key,JSON.stringify(p.row)]);added++;
  }
 }
 return {journey:j.code,rows:rows.length,added,updated,unchanged,dry_run:Boolean(o['dry-run']),note:'Original columns retained. Deliverables, impacts, personas and goals stay in source_data for reviewed mapping. No approvals or evidence inferred.'};
}
export async function run(db,c,o={},pos=[]){
 if(c==='help')return {commands,usage:'npm run journeys -- <command> --key=value --json',mutations:'Every change requires --actor. See .claude/commands for each command.'};
 if(reports[c])return db.query(reports[c]);
 if(c==='weekly-review'){
  const out={};for(const x of ['journeys','attention','priorities','owner-load','outcomes'])out[x]=await run(db,x);return out;
 }
 if(mutations.includes(c)){
  requireValue(o,'actor');await db.exec('BEGIN');
  try{
   await db.query("select set_config('app.actor',$1,true)",[o.actor]);
   const out=await write(db,c,o,pos);
   // Keep the human's rationale with each mutation, including review decisions.
   if(o.note)await db.query("insert into audit_log(entity,record_id,action,actor,after_data) values('operator-note',$1,$2,$3,$4)",[out.id||'00000000-0000-0000-0000-000000000000',c,o.actor,JSON.stringify({note:o.note})]);
   await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return out;
  }catch(e){await db.exec('ROLLBACK');throw e;}
 }
 if(c==='export'){
  const out={format:'customer-journeys-v1',exported_at:new Date().toISOString(),records:{}};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try{for(const t of tables)out.records[t]=await db.query(`select * from ${t} order by ${t==='audit_log'?'at,id':'id'}`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  if(o.file){const dest=path.resolve(o.file);fs.mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});fs.writeFileSync(dest,JSON.stringify(out,null,2)+'\n',{mode:0o600,flag:'wx'});return {file:dest,counts:Object.fromEntries(Object.entries(out.records).map(([k,v])=>[k,v.length]))};}return out;
 }
 if(c==='draft-review'||c==='draft-brief'){
  const j=await resolve(db,'journeys',requireValue(o,'ref'));
  const data=await db.query('select position,name,channel,customer_action,pain,owner from steps where journey_id=$1 order by position,id',[j.id]);
  const actions=await db.query('select o.code,o.name,o.owner,o.state,o.due_on from opportunities o join steps s on s.id=o.step_id where s.journey_id=$1 order by o.code',[j.id]);
  const file=writeOut('drafts',`${c}-${j.code.replace(/[^a-z0-9-]/gi,'-')}-${Date.now()}`,page({title:c==='draft-review'?'Draft journey review':'Draft journey brief',subtitle:j.name,sections:[{title:'Customer steps',html:table(data)},{title:'Improvement decisions',html:table(actions)}]}));return {file,draft:true};
 }
 throw Error(`Unknown command ${c}. Run help.`);
}
export function format(v){
 if(Array.isArray(v)){
  if(!v.length)return 'No records.';const cols=Object.keys(v[0]);const cell=x=>typeof x==='object'&&x!==null?JSON.stringify(x):String(x??'');
  return [cols.join(' | '),cols.map(()=> '---').join(' | '),...v.map(row=>cols.map(k=>cell(row[k]).replace(/\r?\n/g,' ')).join(' | '))].join('\n');
 }
 if(v&&typeof v==='object')return Object.entries(v).map(([k,x])=>`${k}:\n${typeof x==='object'?format(x):x}`).join('\n');return String(v);
}
export function parseArgs(args){
 const pos=[],o={};for(const arg of args){if(arg.startsWith('--')){const at=arg.indexOf('=');if(at<0){if(!['--json','--dry-run','--update','--help'].includes(arg))throw Error(`Use --key=value: ${arg}`);o[arg.slice(2)]=true;}else{o[arg.slice(2,at)]=arg.slice(at+1);}}else pos.push(arg);}
 return {c:o.help?'help':pos.shift()||'help',o,pos};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const {c,o,pos}=parseArgs(process.argv.slice(2));db=await getDb();const out=await run(db,c,o,pos);console.log(o.json?JSON.stringify(out,null,2):format(out));}
 catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
