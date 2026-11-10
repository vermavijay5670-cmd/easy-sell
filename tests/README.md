# Tests

- `npm test` runs the unit/component tests in `src/__tests__` (cart rules, shop settings, Manage Products). No setup needed.
- `bash tests/api/run.sh` is an optional developer check of the database rules (prices, stock, access control, cancellation,
  admin tools) using the real Supabase client against a local Postgres + PostgREST. See the header of `run.sh` for requirements.
