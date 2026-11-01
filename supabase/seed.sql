insert into journeys(id,code,name,owner,persona,goal,review_due) values
 ('10000000-0000-0000-0000-000000000001','ONBOARD','Business account onboarding','Mere','Small business owner','Complete the first order',current_date-7),
 ('10000000-0000-0000-0000-000000000002','RENEW','Annual service renewal','Ravi','Returning account owner','Renew with a clear service plan',current_date+14)
on conflict do nothing;
insert into steps(id,journey_id,name,position,channel,customer_action,pain,owner,revision) values
 ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Send account documents',1,'Email','Send business details','Repeating the same details','Mere',2),
 ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Place first order',2,'Phone','Confirm product availability','No clear dispatch date','Ravi',1),
 ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Review service plan',1,'Meeting','Choose next year service','Unclear scope changes','Ravi',1)
on conflict do nothing;
insert into evidence(id,code,step_id,step_revision,summary,source,observed_on,review_due,purpose,personal) values
 ('30000000-0000-0000-0000-000000000001','EV-OLD','20000000-0000-0000-0000-000000000001',1,'Fictional interview noted duplicate questions','demo:interview-01',current_date-100,current_date-10,'',true),
 ('30000000-0000-0000-0000-000000000002','EV-ORDER','20000000-0000-0000-0000-000000000002',1,'Fictional call review found dispatch uncertainty','demo:call-review',current_date-3,current_date+30,'Understand order communication',false),
 ('30000000-0000-0000-0000-000000000003','EV-RENEW','20000000-0000-0000-0000-000000000003',1,'Fictional renewal review confirmed unclear changes','demo:renewal-review',current_date-2,current_date+30,'Improve renewal explanations',false)
on conflict do nothing;
insert into opportunities(id,code,step_id,name,owner,due_on,impact,effort,state,decision_note,decided_by) values
 ('40000000-0000-0000-0000-000000000001','OP-DOCS','20000000-0000-0000-0000-000000000001','Ask for details once','',current_date-4,5,2,'proposed','',''),
 ('40000000-0000-0000-0000-000000000002','OP-DATE','20000000-0000-0000-0000-000000000002','Confirm dispatch date','Ravi',current_date+7,4,1,'approved','Test clearer wording','Mere'),
 ('40000000-0000-0000-0000-000000000003','OP-PLAN','20000000-0000-0000-0000-000000000003','Explain plan changes','Mere',current_date+10,3,2,'proposed','','')
on conflict do nothing;
insert into metrics(id,opportunity_id,name,value,unit,observed_on,source) values
 ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002','Dispatch clarity',40,'percent',current_date-14,'demo:survey-baseline'),
 ('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','Dispatch clarity',70,'percent',current_date-1,'demo:survey-followup')
on conflict do nothing;
