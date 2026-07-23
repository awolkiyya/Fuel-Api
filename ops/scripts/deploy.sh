#!/bin/sh

set -e


APP_DIR="/home/oiadmin/apps/Fuel-Api"


echo "======================================"
echo "🚀 Fuel API Deployment Started"
echo "======================================"


cd "$APP_DIR"



echo "📥 Syncing latest code..."

git fetch origin main

git reset --hard origin/main



echo "🔐 Fixing script permissions..."

chmod +x ops/scripts/*.sh



echo "🐳 Building and starting containers..."

docker compose --env-file .env.production up -d --build



echo "⏳ Waiting for services..."

sleep 10



echo "🔍 Checking container status..."

docker compose ps



echo "🏥 Checking API health..."

curl -f http://localhost/health || {
    echo "❌ API health check failed"
    exit 1
}



echo "🧹 Cleaning unused Docker images..."

docker image prune -f



echo "======================================"
echo "✅ Fuel API Deployment Completed"
echo "======================================"