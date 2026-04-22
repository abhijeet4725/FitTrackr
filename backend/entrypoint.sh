#!/bin/sh
# entrypoint.sh
# -------------
# Runs database migrations then starts the Flask development server.
# Executed automatically when the backend container starts.

set -e

echo "──────────────────────────────────────────"
echo "  FinTrackr Backend — Container Starting"
echo "──────────────────────────────────────────"

# Auto-generate the initial migration if migrations/versions/ is empty.
# This handles a fresh clone where no migration files exist yet.
MIGRATION_COUNT=$(find /app/migrations/versions -maxdepth 1 -name "*.py" 2>/dev/null | wc -l)

if [ "$MIGRATION_COUNT" -eq 0 ]; then
  echo "📋 No migration files found — generating initial schema migration..."
  flask db migrate -m "initial schema"
fi

echo "⏳ Applying database migrations..."
flask db upgrade
echo "✅ Migrations applied."

echo "🚀 Starting Flask server on 0.0.0.0:5000 ..."
exec python run.py
