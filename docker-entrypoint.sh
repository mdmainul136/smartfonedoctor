#!/bin/sh
set -e

echo "🚀 Starting SmartFone Doctor Application..."

# Automatically sync Prisma database schema on startup if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Verifying database connection and pushing schema..."
  npx prisma db push --skip-generate || true
fi

exec "$@"
