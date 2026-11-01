import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
export async function seed(db){
 await db.exec('BEGIN');
 try {await db.query("select set_config('app.actor','Demo seed',true)");await db.exec(fs.readFileSync(path.join(REPO_ROOT,'supabase/seed.sql'),'utf8'));await db.exec('COMMIT');}
 catch(e){await db.exec('ROLLBACK');throw e;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const db=await getDb();try{if(db.mode==='postgres'&&!process.argv.includes('--demo-database'))throw Error('Use --demo-database only for a disposable PostgreSQL database');await seed(db);console.log('Fictional journey demo seeded');}finally{await db.close();}
}
