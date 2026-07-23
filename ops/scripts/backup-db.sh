#!/bin/sh

set -e


# ==========================
# Configuration
# ==========================

BACKUP_DIR="/home/oiadmin/backups/fuel-system"

CONTAINER_NAME="fuel-postgres"

DATABASE_USER="admin"

DATABASE_NAME="fuel_system"

RETENTION_DAYS=30


DATE=$(date +"%Y-%m-%d_%H-%M-%S")

BACKUP_FILE="$BACKUP_DIR/fuel_system_$DATE.sql.gz"



echo "======================================"
echo "💾 Fuel System Database Backup"
echo "$(date)"
echo "======================================"


# Create backup directory

mkdir -p "$BACKUP_DIR"



# Check PostgreSQL container

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then

    echo "❌ PostgreSQL container not running: $CONTAINER_NAME"

    exit 1

fi



echo "📦 Creating PostgreSQL backup..."



docker exec "$CONTAINER_NAME" \
pg_dump \
-U "$DATABASE_USER" \
"$DATABASE_NAME" \
| gzip > "$BACKUP_FILE"



# Verify backup exists

if [ ! -f "$BACKUP_FILE" ]; then

    echo "❌ Backup failed"

    exit 1

fi



BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)



echo "✅ Backup completed"

echo "File: $BACKUP_FILE"

echo "Size: $BACKUP_SIZE"



# Remove old backups

echo "🧹 Removing backups older than $RETENTION_DAYS days..."

find "$BACKUP_DIR" \
-type f \
-name "*.sql.gz" \
-mtime +"$RETENTION_DAYS" \
-delete



echo "======================================"
echo "✅ Backup Finished Successfully"
echo "======================================"