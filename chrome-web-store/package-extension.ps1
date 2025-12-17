# Package Extension for Chrome Web Store
# Run this script from the time-tracker-extension directory

Write-Host "📦 Packaging Skill Time Tracker Extension..." -ForegroundColor Cyan
Write-Host ""

# Define paths
$extensionRoot = Get-Location
$outputFolder = Join-Path $extensionRoot "chrome-web-store"
$outputZip = Join-Path $outputFolder "time-tracker-extension-v1.0.0.zip"

# Create output folder if it doesn't exist
if (-not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
}

# Remove old ZIP if exists
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
    Write-Host "🗑️  Removed old ZIP file" -ForegroundColor Yellow
}

# Files and folders to include
$include = @(
    "*.js",
    "*.html",
    "*.css",
    "*.json",
    "*.md",
    "*.txt",
    "icons"
)

# Get all files to include
$filesToZip = @()
foreach ($pattern in $include) {
    $filesToZip += Get-ChildItem -Path $pattern -Recurse -ErrorAction SilentlyContinue
}

# Remove duplicates and filter out chrome-web-store folder
$filesToZip = $filesToZip | Where-Object { 
    $_.FullName -notlike "*chrome-web-store*" 
} | Select-Object -Unique

Write-Host "📋 Files to include:" -ForegroundColor Green
$filesToZip | ForEach-Object { Write-Host "   ✓ $($_.Name)" -ForegroundColor Gray }
Write-Host ""

# Create temporary folder
$tempFolder = Join-Path $env:TEMP "time-tracker-temp"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy files to temp folder maintaining structure
foreach ($file in $filesToZip) {
    $relativePath = $file.FullName.Substring($extensionRoot.Path.Length + 1)
    $destination = Join-Path $tempFolder $relativePath
    $destinationDir = Split-Path $destination -Parent
    
    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }
    
    Copy-Item $file.FullName -Destination $destination -Force
}

# Create ZIP
Write-Host "🗜️  Creating ZIP archive..." -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $tempFolder "*") -DestinationPath $outputZip -Force

# Clean up temp folder
Remove-Item $tempFolder -Recurse -Force

# Display results
Write-Host ""
Write-Host "✅ Extension packaged successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Location: $outputZip" -ForegroundColor Yellow
Write-Host "📊 Size: $([math]::Round((Get-Item $outputZip).Length / 1KB, 2)) KB" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Generate promotional images using create-images.html" -ForegroundColor White
Write-Host "   2. Go to: https://chrome.google.com/webstore/devconsole" -ForegroundColor White
Write-Host "   3. Upload: $outputZip" -ForegroundColor White
Write-Host "   4. Fill in store listing using STORE-LISTING.md" -ForegroundColor White
Write-Host "   5. Submit for review!" -ForegroundColor White
Write-Host ""
