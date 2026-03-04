#!/bin/bash

# MongoDB Restore Script for FoodBridge
# This script restores a MongoDB backup

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: ./restore-db.sh <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -1 ./backups/*.tar.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${MONGODB_DB_NAME:-foodbridge}"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017}"
TEMP_DIR="./temp_restore"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Create temp directory
mkdir -p "$TEMP_DIR"

# Extract backup
echo "📦 Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Failed to extract backup"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Find the backup directory
BACKUP_DIR=$(find "$TEMP_DIR" -name "$DB_NAME" -type d | head -n 1)

if [ -z "$BACKUP_DIR" ]; then
    echo "❌ Could not find database backup in archive"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Perform restore
echo "🔄 Restoring database..."
mongorestore --uri="$MONGODB_URI" --db="$DB_NAME" --drop "$BACKUP_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    rm -rf "$TEMP_DIR"
    echo "✨ Restore process completed!"
else
    echo "❌ Restore failed!"
    rm -rf "$TEMP_DIR"
    exit 1
fi
