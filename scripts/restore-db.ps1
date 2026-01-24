param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

# ================= CONFIGURATION =================
# Pastikan ini sama dengan script backup
$containerName = "trinity-postgres"
$dbUser = "tri nity_admin"
$dbName = "trinity_inventory_db" 
# =================================================

# 1. Validasi File
if (-not (Test-Path -Path $BackupFile)) {
    Write-Host "[ERROR] File backup tidak ditemukan: $BackupFile" -ForegroundColor Red
    exit
}

# 2. Cek Container
$containerStatus = docker inspect -f '{{.State.Running}}' $containerName 2>$null
if ($containerStatus -ne 'true') {
    Write-Host "[ERROR] Container '$containerName' mati. Nyalakan dulu." -ForegroundColor Red
    exit
}

# 3. PERINGATAN KERAS (Safety Check)
Clear-Host
Write-Host "==========================================" -ForegroundColor Red
Write-Host "           BAHAYA - RESTORE DATABASE      " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Red
Write-Host "Target Database  : $dbName"
Write-Host "Target Container : $containerName"
Write-Host "Source File      : $BackupFile"
Write-Host ""
Write-Host "PERINGATAN: Seluruh data baru di database '$dbName' mungkin akan TIMPA/HILANG"
Write-Host "tergantung isi file backup Anda."
Write-Host ""
$confirmation = Read-Host "Ketik 'YES' untuk melanjutkan proses restore"

if ($confirmation -ne 'YES') {
    Write-Host "Proses dibatalkan." -ForegroundColor Gray
    exit
}

# 4. Eksekusi Restore
Write-Host "`n[PROCESS] Sedang me-restore database... Mohon tunggu..." -ForegroundColor Cyan

try {
    # TRIK WINDOWS:
    # PowerShell kadang bermasalah dengan pipe '|' untuk file SQL besar ke Docker.
    # Kita gunakan 'Get-Content' lalu dipipe ke 'docker exec -i' (interactive mode).
    
    Get-Content -Path $BackupFile | docker exec -i $containerName psql -U $dbUser -d $dbName

    # Jika script sampai sini tanpa catch, kita asumsikan perintah jalan
    Write-Host "`n[SUCCESS] Proses restore selesai." -ForegroundColor Green
    Write-Host "Silakan cek data Anda di aplikasi."
}
catch {
    Write-Host "`n[ERROR] Gagal melakukan restore." -ForegroundColor Red
    Write-Host $_.Exception.Message
}