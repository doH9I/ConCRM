#!/bin/bash

# Backup script for CRM system

set -e

# Configuration
BACKUP_DIR="/opt/crm/backups"
DB_NAME="crm_prod"
DB_USER="postgres"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="crm_backup_${DATE}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        mkdir -p "$BACKUP_DIR"
        log "Created backup directory: $BACKUP_DIR"
    fi
}

# Create database backup
create_backup() {
    log "Creating database backup..."
    
    if pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"; then
        log "Database backup created: $BACKUP_FILE"
        
        # Compress backup
        gzip "$BACKUP_DIR/$BACKUP_FILE"
        log "Backup compressed: $COMPRESSED_FILE"
        
        # Get backup size
        BACKUP_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
        log "Backup size: $BACKUP_SIZE"
        
        return 0
    else
        error "Failed to create database backup"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    find "$BACKUP_DIR" -name "crm_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    log "Old backups cleaned up"
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    # Test restore to temporary database
    TEMP_DB="crm_backup_test_${DATE}"
    
    # Create temporary database
    createdb -U "$DB_USER" "$TEMP_DB" 2>/dev/null || true
    
    # Try to restore backup
    if gunzip -c "$BACKUP_DIR/$COMPRESSED_FILE" | psql -U "$DB_USER" -d "$TEMP_DB" >/dev/null 2>&1; then
        log "Backup verification successful"
        
        # Drop temporary database
        dropdb -U "$DB_USER" "$TEMP_DB" 2>/dev/null || true
        
        return 0
    else
        error "Backup verification failed"
        
        # Clean up temporary database
        dropdb -U "$DB_USER" "$TEMP_DB" 2>/dev/null || true
        
        return 1
    fi
}

# Upload to cloud storage (optional)
upload_to_cloud() {
    if command -v aws &> /dev/null; then
        log "Uploading backup to S3..."
        
        BUCKET_NAME="your-crm-backups-bucket"
        aws s3 cp "$BACKUP_DIR/$COMPRESSED_FILE" "s3://$BUCKET_NAME/crm-backups/" --storage-class STANDARD_IA
        
        if [[ $? -eq 0 ]]; then
            log "Backup uploaded to S3 successfully"
        else
            warning "Failed to upload backup to S3"
        fi
    else
        log "AWS CLI not found, skipping cloud upload"
    fi
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Send to Telegram if configured
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=🔄 CRM Backup: $status%0A$message" \
            -d "parse_mode=HTML" >/dev/null 2>&1
    fi
    
    # Send email if configured
    if command -v mail &> /dev/null && [[ -n "$BACKUP_EMAIL" ]]; then
        echo "$message" | mail -s "CRM Backup: $status" "$BACKUP_EMAIL"
    fi
}

# Main backup function
main() {
    log "Starting CRM backup process..."
    
    # Check if PostgreSQL is running
    if ! pg_isready -U "$DB_USER" >/dev/null 2>&1; then
        error "PostgreSQL is not running"
        send_notification "FAILED" "PostgreSQL is not running"
        exit 1
    fi
    
    # Create backup directory
    create_backup_dir
    
    # Create backup
    if create_backup; then
        # Verify backup
        if verify_backup; then
            # Clean up old backups
            cleanup_old_backups
            
            # Upload to cloud (optional)
            upload_to_cloud
            
            # Send success notification
            send_notification "SUCCESS" "Backup completed: $COMPRESSED_FILE"
            
            log "Backup process completed successfully!"
            exit 0
        else
            error "Backup verification failed"
            send_notification "FAILED" "Backup verification failed"
            exit 1
        fi
    else
        error "Backup creation failed"
        send_notification "FAILED" "Backup creation failed"
        exit 1
    fi
}

# Handle script interruption
trap 'error "Backup interrupted by user"; exit 1' INT TERM

# Run main function
main "$@"