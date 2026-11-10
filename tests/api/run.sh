#!/usr/bin/env bash
# Optional developer test: runs the app's real database queries against a throw-away local
# Postgres with every migration applied, through PostgREST (the API server Supabase uses).
#
# Needs: PostgreSQL running locally, the `postgrest` binary on PATH, node + `npm install`.
#   ADMIN_URL  superuser connection to a maintenance db (default postgresql://postgres:postgres@127.0.0.1/postgres)
# Usage: bash tests/api/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
ADMIN_URL=${ADMIN_URL:-postgresql://postgres:postgres@127.0.0.1/postgres}
DB=shop_api_test
API_PORT=${API_PORT:-3001}
JWT_SECRET="super-secret-jwt-key-for-local-test-1234567890"
TMP=$(mktemp -d)
trap 'kill $PGRST_PID 2>/dev/null || true; rm -rf "$TMP"' EXIT

psql "$ADMIN_URL" -qAt -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB"
psql "$ADMIN_URL" -qAt -c "DO \$\$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$" \
                       -c "DO \$\$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$" \
                       -c "DO \$\$ BEGIN CREATE ROLE authenticator LOGIN NOINHERIT PASSWORD 'pw'; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$"
DB_URL="${ADMIN_URL%/*}/$DB"
run_sql() { psql "$DB_URL" -q -v ON_ERROR_STOP=1 -f "$1" 2>&1 | grep -v -E "NOTICE|wal_level|HINT" || true; }

run_sql tests/api/shim.sql
for f in supabase-schema supabase-migration-customer-auth supabase-migration-order-safety \
         supabase-migration-products supabase-migration-settings supabase-migration-admin-orders \
         supabase-migration-customer-cancel supabase-migration-hardening; do run_sql "$f.sql"; done
# telegram migration with dummy values (pg_net is stubbed by shim.sql)
sed -e "s/YOUR_PROJECT_REF/abc123/g; s/YOUR_WEBHOOK_SECRET/s3cret/g; s/^CREATE EXTENSION.*//" supabase-migration-telegram.sql > "$TMP/tg.sql"
run_sql "$TMP/tg.sql"
psql "$DB_URL" -qAt -c "INSERT INTO auth.users(id,email) VALUES
 ('11111111-1111-1111-1111-111111111111','alice@x.com'),('22222222-2222-2222-2222-222222222222','bob@x.com'),('99999999-9999-9999-9999-999999999999','admin@x.com')" \
  -c "INSERT INTO admins VALUES ('99999999-9999-9999-9999-999999999999')"

HOSTPORT=${ADMIN_URL#*@}; HOSTPORT=${HOSTPORT%%/*}
cat > "$TMP/pgrst.conf" <<CONF
db-uri = "postgres://authenticator:pw@$HOSTPORT/$DB"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "$JWT_SECRET"
server-port = $API_PORT
CONF
postgrest "$TMP/pgrst.conf" >"$TMP/pgrst.log" 2>&1 &
PGRST_PID=$!
sleep 3
API_PORT=$API_PORT node tests/api/e2e.mjs
