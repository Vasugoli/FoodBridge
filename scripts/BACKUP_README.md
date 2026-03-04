# MongoDB Backup Scripts for Windows

## Backup Script (PowerShell)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\backups"
$dbName = if ($env:MONGODB_DB_NAME) { $env:MONGODB_DB_NAME } else { "foodbridge" }
$mongoUri = if ($env:MONGODB_URI) { $env:MONGODB_URI } else { "mongodb://localhost:27017" }

# Create backup directory
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

$backupFile = "$backupDir\foodbridge_backup_$timestamp"

Write-Host "🔄 Starting MongoDB backup..." -ForegroundColor Cyan
Write-Host "Database: $dbName"
Write-Host "Backup location: $backupFile"

# Perform backup
mongodump --uri="$mongoUri" --db="$dbName" --out="$backupFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup completed successfully!" -ForegroundColor Green

    # Compress backup
    Write-Host "📦 Compressing backup..." -ForegroundColor Cyan
    Compress-Archive -Path "$backupFile\*" -DestinationPath "$backupFile.zip"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup compressed: $backupFile.zip" -ForegroundColor Green
        # Remove uncompressed backup
        Remove-Item -Recurse -Force $backupFile
    }

    # Keep only last 7 backups
    Write-Host "🧹 Cleaning old backups (keeping last 7)..." -ForegroundColor Cyan
    Get-ChildItem "$backupDir\*.zip" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 7 |
        Remove-Item -Force

    Write-Host "✨ Backup process completed!" -ForegroundColor Green
} else {
    Write-Host "❌ Backup failed!" -ForegroundColor Red
    exit 1
}

## To run this script:
## 1. Save as backup-db.ps1
## 2. Run: powershell -ExecutionPolicy Bypass -File .\backup-db.ps1
