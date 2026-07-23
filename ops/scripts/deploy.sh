#!/bin/sh

set -e


APP_DIR="/home/fueladmin/apps/fuel-api"


echo "======================================"
echo "🚀 Fuel API Deployment Started"
echo "======================================"


cd "$APP_DIR"



echo "📥 Pulling latest code..."

git pull origin main



echo "🐳 Building and starting containers..."

docker compose up -d --build



echo "⏳ Waiting for services..."

sleep 10



echo "🔍 Checking container status..."

docker compose ps



echo "🧹 Cleaning unused Docker images..."

docker image prune -f



echo "======================================"
echo "✅ Fuel API Deployment Completed"
echo "======================================"