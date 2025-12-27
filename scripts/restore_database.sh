#!/bin/bash
# MongoDB Restore Script for Chit Fund App
# Use this to restore from a backup

if [ -z "$1" ]; then
    echo "Usage: ./restore_database.sh <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$HOME/chitfund_backups"/*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
TEMP_DIR=$(mktemp -d)

echo "Starting restore from: $BACKUP_FILE"

# Extract backup
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# MongoDB connection string
MONGO_URI="mongodb+srv://appuser:Ine9xDFzXOS0XUGO@cluster0.9itng.mongodb.net/chitfund_db"

# Restore database
echo "Restoring database..."
mongorestore --uri="$MONGO_URI" --drop "$TEMP_DIR"/*

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"
echo "Restore completed at $(date)"
