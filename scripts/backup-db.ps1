# ================= CONFIGURATION =================
# Nama Container (Ambil dari kolom NAMES di docker ps)
$containerName = "trinity-postgres"

# Nama User Database (Default postgres image biasanya 'postgres')
$dbUser = "trinity_admin"

# Nama Database (GANTI INI sesuai hasil cek di Langkah 1)
$dbName = "trinity_inventory_db" 

# Folder Backup
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupFolder = "backups"
$fileName = "$backupFolder\backup_trinity_$date.sql"
# =================================================

# 1. Buat folder 'backups' jika belum ada
if (!(Test-Path -Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
    Write-Host "[INFO] Folder '$backupFolder' berhasil dibuat." -ForegroundColor Cyan
}

# 2. Cek apakah container hidup
$containerStatus = docker inspect -f '{{.State.Running}}' $containerName 2>$null
if ($containerStatus -ne 'true') {
    Write-Host "[ERROR] Container '$containerName' tidak ditemukan atau sedang mati." -ForegroundColor Red
    Write-Host "Tips: Cek nama container dengan 'docker ps'" -ForegroundColor Gray
    exit
}

# 3. Eksekusi Backup (Direct Container)
Write-Host "[PROCESS] Sedang mem-backup database '$dbName' dari container '$containerName'..." -ForegroundColor Yellow

try {
    # Kita gunakan 'docker exec -i' (interactive) agar output stream lancar ke file
    docker exec -i $containerName pg_dump -U $dbUser --no-owner --no-acl $dbName | Out-File -FilePath $fileName -Encoding utf8
}
catch {
    Write-Host "[ERROR] Terjadi kesalahan sistem saat backup." -ForegroundColor Red
    exit
}

# 4. Validasi Hasil
if (Test-Path -Path $fileName) {
    $item = Get-Item $fileName
    if ($item.Length -gt 0) {
        $size = $item.Length / 1KB
        Write-Host "[SUCCESS] Backup Berhasil!" -ForegroundColor Green
        Write-Host "Lokasi: $fileName"
        Write-Host "Ukuran: $([math]::Round($size, 2)) KB"
    } else {
        Write-Host "[ERROR] File backup Kosong (0 KB). Kemungkinan nama database '$dbName' salah." -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] File backup gagal dibuat." -ForegroundColor Red
}