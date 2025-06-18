#!/bin/sh
# Make sure TypeScript is compiled
echo "Building TypeScript code..."
npm run build
echo "Build completed. Directory listing of dist/:"
ls -la dist/

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until npx prisma db push --accept-data-loss 2>/dev/null
do
  echo "PostgreSQL is not ready yet. Retrying in 5 seconds..."
  sleep 5
done

echo "PostgreSQL is ready. Running Prisma migrations..."

# Run Prisma migrations
npx prisma migrate deploy

echo "Migrations completed. Initializing database..."

# Run database initialization script
npm run db:init

echo "Database initialization completed. Starting the application..."

# Run database seeding
npm run db:seed
echo "Database seeding completed."

# Start the application
npm start
