#!/usr/bin/env bash
# Applies the migrations to a throwaway local Postgres and checks that the
# access rules actually behave — that a client cannot read another client's
# records, cannot price their own order, and that a stranger reaching for the
# rail gets the view rather than the table.
#
# Needs only Postgres 17 (brew install postgresql@17). It stubs the handful of
# Supabase objects the schema leans on, so it tests the SQL we wrote rather
# than Supabase itself.
#
#   ./supabase/tests/run.sh
set -euo pipefail
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
DB=tidote_test
HERE="$(cd "$(dirname "$0")" && pwd)"

pg_isready -q || { echo "Postgres is not running."; exit 1; }

# --force disconnects anything still holding the database — a leftover psql, or
# a PostgREST pointed at it. Without this the drop fails and the run silently
# tests whatever was there before, which is worse than not running at all.
dropdb --if-exists --force "$DB"
createdb "$DB"

psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$HERE/00_supabase_stub.sql"
for f in "$HERE"/../migrations/0*.sql; do
  psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$f" > /dev/null
  echo "applied $(basename "$f")"
done
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$HERE/01_fixtures.sql"
psql -v ON_ERROR_STOP=1 -q -d "$DB" -f "$HERE/02_access_rules.sql" > /dev/null 2>&1

echo
psql -q -d "$DB" -P pager=off \
  -c "select case when pass then 'PASS' else '** FAIL **' end as result, test from results order by n;"
FAILED=$(psql -qtA -d "$DB" -c "select count(*) from results where not pass;")
psql -qtA -d "$DB" -c "select count(*) filter (where pass) || ' / ' || count(*) || ' passed' from results;"
exit "$FAILED"
