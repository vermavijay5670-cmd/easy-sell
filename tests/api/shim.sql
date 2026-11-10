-- TEST ONLY: stands in for the parts of Supabase the migrations rely on (auth schema, roles, storage, pg_net).
-- Never run this on a real Supabase project.
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text);
-- Supabase-style: identity comes from the JWT claims PostgREST sets for each request
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif((nullif(current_setting('request.jwt.claims', true),'')::jsonb)->>'sub','')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true),'')::jsonb->>'role', 'anon') $$;
CREATE PUBLICATION supabase_realtime;
GRANT anon, authenticated TO authenticator;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
-- storage + pg_net stand-ins
CREATE SCHEMA storage;
CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
CREATE TABLE storage.objects (id serial PRIMARY KEY, bucket_id text);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE SCHEMA net; CREATE SCHEMA extensions;
CREATE TABLE net.calls(n serial, body jsonb);
CREATE FUNCTION net.http_post(url text, body jsonb DEFAULT '{}', params jsonb DEFAULT '{}', headers jsonb DEFAULT '{}', timeout_milliseconds int DEFAULT 5000) RETURNS bigint LANGUAGE plpgsql AS $$ BEGIN INSERT INTO net.calls(body) VALUES (body); RETURN 1; END $$;
