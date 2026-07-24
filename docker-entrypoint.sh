#!/bin/sh
set -e

echo "Running Prisma migrations..."

until npx prisma migrate deploy; do
    echo "Database unavailable - retrying in 3 seconds..."
    sleep 3
done

echo "Starting Fuel API..."

exec npm start