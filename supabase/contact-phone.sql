create or replace function public.submit_contact_inquiry(p_document jsonb,p_hash text)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare saved public.inquiries; request_uuid uuid := (p_document->>'requestId')::uuid;
begin
  perform pg_advisory_xact_lock(8307004);
  select * into saved from public.inquiries where request_id=request_uuid;
  if found then
    if saved.payload_hash<>p_hash then return jsonb_build_object('error','request_conflict'); end if;
    return jsonb_build_object('id',saved.id,'duplicate',true);
  end if;
  if (select count(*) from public.inquiries where created_at>now()-interval '1 hour' and email=p_document->>'email')>=5
     or (select count(*) from public.inquiries where created_at>now()-interval '1 hour')>=60
     then return jsonb_build_object('error','rate_limit'); end if;
  insert into public.inquiries(name,email,phone,company,website,services,type,message,request_id,payload_hash,consent_version,consent_at,transfer_consent_at)
  values(p_document->>'name',p_document->>'email',nullif(p_document->>'phone',''),p_document->>'company',nullif(p_document->>'website',''),
    array(select jsonb_array_elements_text(p_document->'services')),
    (select string_agg(value,' · ') from jsonb_array_elements_text(p_document->'services')),
    p_document->>'message',request_uuid,p_hash,p_document->>'consentVersion',now(),now()) returning * into saved;
  insert into public.inquiry_notifications(inquiry_id) values(saved.id);
  return jsonb_build_object('id',saved.id,'duplicate',false);
end $$;
revoke all on function public.submit_contact_inquiry(jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_contact_inquiry(jsonb,text) to service_role;
