create table journeys (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 owner text not null default '', persona text not null default '', goal text not null default '',
 review_due date, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table steps (
 id uuid primary key default gen_random_uuid(), journey_id uuid not null references journeys(id),
 name text not null, position integer not null check(position>0), channel text not null default '',
 customer_action text not null default '', pain text not null default '', owner text not null default '',
 revision integer not null default 1 check(revision>0), source_key text, source_data jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(journey_id,source_key)
);
create table evidence (
 id uuid primary key default gen_random_uuid(), code text not null unique, step_id uuid not null references steps(id),
 step_revision integer not null, summary text not null, source text not null,
 observed_on date not null, review_due date not null, purpose text not null default '',
 personal boolean not null default false, state text not null default 'active' check(state in ('active','withdrawn')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(review_due>=observed_on)
);
create table opportunities (
 id uuid primary key default gen_random_uuid(), code text not null unique, step_id uuid not null references steps(id),
 name text not null, owner text not null default '', due_on date,
 impact integer not null check(impact between 1 and 5), effort integer not null check(effort between 1 and 5),
 state text not null default 'proposed' check(state in ('proposed','approved','rejected','done')),
 decision_note text not null default '', decided_by text not null default '',
 outcome_note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table metrics (
 id uuid primary key default gen_random_uuid(), opportunity_id uuid not null references opportunities(id),
 name text not null, value numeric not null, unit text not null, observed_on date not null, source text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_log (
 id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null,
 action text not null, actor text not null, before_data jsonb, after_data jsonb, at timestamptz not null default now()
);
create function touch_record() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;
create function audit_record() returns trigger language plpgsql as $$
begin
 insert into audit_log(entity,record_id,action,actor,before_data,after_data)
 values(TG_TABLE_NAME,new.id,TG_OP,coalesce(nullif(current_setting('app.actor',true),''),'database operator'),
 case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new)); return new;
end $$;
create function revise_step() returns trigger language plpgsql as $$
begin
 if (new.name,new.channel,new.customer_action,new.pain,new.source_data) is distinct from
 (old.name,old.channel,old.customer_action,old.pain,old.source_data) then
 new.revision=old.revision+1;
 update journeys set reviewed_at=null where id=new.journey_id;
 end if; return new;
end $$;
create trigger revision before update on steps for each row execute function revise_step();
DO $$ declare t text; begin
 foreach t in array array['journeys','steps','evidence','opportunities','metrics'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_record()',t);
 execute format('create trigger audit after insert or update on %I for each row execute function audit_record()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop; end $$;
alter table audit_log enable row level security;
revoke all on audit_log from public;
create view evidence_health as
 select e.*,s.name as step,s.revision as current_revision,j.code as journey,
 (e.state='active' and e.step_revision=s.revision and e.review_due>=current_date and e.observed_on<=current_date) as current
 from evidence e join steps s on s.id=e.step_id join journeys j on j.id=s.journey_id;
create view journey_health as
 select j.id,j.code,j.name,j.owner,j.review_due,
 (select count(*)::integer from steps s where s.journey_id=j.id) as steps,
 (select count(*)::integer from steps s where s.journey_id=j.id and not exists
 (select 1 from evidence_health e where e.step_id=s.id and e.current)) as evidence_gaps,
 (select count(*)::integer from opportunities o join steps s on s.id=o.step_id where s.journey_id=j.id and o.state in ('proposed','approved') and o.due_on<current_date) as overdue_actions
 from journeys j;
create view priority_queue as
 select o.id,o.code,o.name,j.code as journey,s.name as step,o.owner,o.due_on,o.state,o.impact,o.effort,
 round(o.impact::numeric/o.effort,2) as priority_score,
 (select count(*)::integer from evidence_health e where e.step_id=s.id and e.current) as current_evidence
 from opportunities o join steps s on s.id=o.step_id join journeys j on j.id=s.journey_id;
create view attention_queue as
 select 'journey' as kind,j.code as reference,j.owner,'Review overdue or missing' as reason from journeys j where j.review_due is null or j.review_due<current_date
 union all select 'opportunity',o.code,o.owner,'Action overdue' from opportunities o where o.state in ('proposed','approved') and o.due_on<current_date
 union all select 'opportunity',o.code,o.owner,'Owner missing' from opportunities o where o.state in ('proposed','approved') and o.owner=''
 union all select 'evidence',e.code,'','Evidence expired, withdrawn or tied to an older step' from evidence_health e where not e.current;
create view compliance_checks as
 select 'PURPOSE' as rule,e.code as reference,'Personal evidence has no recorded collection purpose' as issue,
 'https://www.privacy.org.nz/privacy-principles/1/' as source from evidence e where e.personal and e.purpose='' and e.state='active'
 union all select 'RETENTION',e.code,'Personal evidence needs retention review',
 'https://www.privacy.org.nz/privacy-principles/9/' from evidence e where e.personal and e.review_due<current_date and e.state='active'
 union all select 'AU-RETENTION',e.code,'Check APP applicability and whether personal information is still needed',
 'https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information'
 from evidence e where e.personal and e.review_due<current_date and e.state='active';
