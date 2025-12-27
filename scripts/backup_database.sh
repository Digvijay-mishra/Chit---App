#!/bin/bash
# MongoDB Backup Script for Chit Fund App
# Run this manually or schedule with cron

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$HOME/chitfund_backups"
BACKUP_FILE="chitfund_backup_$TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"
echo "Backing up database to: $BACKUP_DIR/$BACKUP_FILE"

# MongoDB connection string (replace with your actual string if different)
MONGO_URI="mongodb+srv://appuser:Ine9xDFzXOS0XUGO@cluster0.9itng.mongodb.net/chitfund_db"

# Create backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "Backup location: $BACKUP_DIR/$BACKUP_FILE"
    
    # Optional: Compress the backup
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_FILE}.tar.gz" "$BACKUP_FILE"
    rm -rf "$BACKUP_FILE"
    
    echo "✅ Compressed backup: ${BACKUP_FILE}.tar.gz"
    
    # Optional: Keep only last 7 backups
    ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +8 | xargs -r rm
    echo "🧹 Old backups cleaned (keeping last 7)"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "Backup completed at $(date)"
