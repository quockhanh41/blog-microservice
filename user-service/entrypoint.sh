#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "PostgreSQL is not ready yet. Retrying in 5 seconds..."
  sleep 5
done

echo "PostgreSQL is ready. Running Prisma migrations..."

# Try to run migration, if it fails due to P3005, baseline first
if ! npx prisma migrate deploy 2>/dev/null; then
  echo "Migration failed, attempting to baseline existing schema..."
  npx prisma migrate resolve --applied 20250612233311_userdb_test
  npx prisma migrate deploy
fi

echo "Migrations completed. Starting the application..."

# Start the application
exec npm start
