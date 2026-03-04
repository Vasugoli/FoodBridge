#!/bin/bash

# MongoDB Backup Script for FoodBridge
# This script creates a backup of the MongoDB database

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DB_NAME="${MONGODB_DB_NAME:-foodbridge}"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/foodbridge_backup_$TIMESTAMP"

echo "🔄 Starting MongoDB backup..."
echo "Database: $DB_NAME"
echo "Backup location: $BACKUP_FILE"

# Perform backup using mongodump
mongodump --uri="$MONGODB_URI" --db="$DB_NAME" --out="$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "Backup saved to: $BACKUP_FILE"

    # Compress the backup
    echo "📦 Compressing backup..."
    tar -czf "$BACKUP_FILE.tar.gz" -C "$BACKUP_DIR" "$(basename $BACKUP_FILE)"

    if [ $? -eq 0 ]; then
        echo "✅ Backup compressed: $BACKUP_FILE.tar.gz"
        # Remove uncompressed backup
        rm -rf "$BACKUP_FILE"
    fi

    # Keep only last 7 backups
    echo "🧹 Cleaning old backups (keeping last 7)..."
    ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +8 | xargs -r rm

    echo "✨ Backup process completed!"
else
    echo "❌ Backup failed!"
    exit 1
fi
