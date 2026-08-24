DO $$
DECLARE f text;
BEGIN
  FOR f IN SELECT unnest(ARRAY[
    'enqueue_email(text, jsonb)','handle_new_user()','move_to_dlq(text, text, bigint, jsonb)',
    'delete_email(text, bigint)','email_queue_dispatch()','email_queue_wake()',
    'prevent_last_admin_removal()','read_email_batch(text, integer, integer)'])
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;