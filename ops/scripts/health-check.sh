#!/bin/sh

set -e


API_URL="http://localhost/health"


echo "======================================"
echo "🏥 Fuel System Health Check"
echo "======================================"


echo ""
echo "🐳 Docker Containers:"
echo ""


docker compose ps



echo ""
echo "🌐 Checking API Health..."
echo ""



STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")



if [ "$STATUS" = "200" ]; then

    echo "✅ API is healthy"

else

    echo "❌ API health check failed"

    echo "HTTP Status: $STATUS"

    exit 1

fi



echo ""
echo "🗄 Checking PostgreSQL..."



docker exec fuel-postgres \
pg_isready \
-U admin \
-d fuel_system



echo ""
echo "======================================"
echo "✅ Health Check Completed"
echo "======================================"