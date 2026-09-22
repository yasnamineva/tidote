#!/usr/bin/env bash
# Rebuilds the test database, puts PostgREST in front of it, and runs the app's
# own queries through supabase-js against it.
#
#   brew install postgresql@17 postgrest
#   ./supabase/tests/run-wiring.sh
set -euo pipefail
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HERE/../.."
CONF="$(mktemp -t postgrest).conf"
PORT="${PORT:-3001}"

"$HERE/run.sh" > /dev/null
psql -q -d tidote_test -c "alter role authenticator with password 'testpw';" > /dev/null

cat > "$CONF" <<CONF
db-uri = "postgres://authenticator:testpw@localhost:5432/tidote_test"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "a-very-long-test-only-signing-secret-0123456789"
server-port = $PORT
CONF

# Whatever answers on this port is what the suite will believe. Once, another
# project's dev server was sitting on it: PostgREST could not bind, the checks
# ran against that app, and eleven of them failed with its 404 page quoted back
# as the row they were expecting. Refuse rather than test a stranger.
if curl -sf -o /dev/null "http://localhost:$PORT/" 2>/dev/null; then
  echo "Something is already listening on port $PORT — stop it, or set PORT."
  exit 1
fi

postgrest "$CONF" > /tmp/postgrest-test.log 2>&1 &
PGRST=$!
trap 'kill $PGRST 2>/dev/null || true; rm -f "$CONF"' EXIT

for _ in $(seq 1 25); do
  curl -sf -o /dev/null "http://localhost:$PORT/" && break
  sleep 1
done

cd "$ROOT" && PORT="$PORT" node supabase/tests/wiring.mjs
