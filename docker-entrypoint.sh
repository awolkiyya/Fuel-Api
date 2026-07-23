#!/bin/sh

set -e


echo "Waiting for database..."

until npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
do
    echo "Database unavailable - retrying..."
    sleep 3
done


echo "Running Prisma migrations..."

npx prisma migrate deploy


echo "Starting Fuel API..."

npm start