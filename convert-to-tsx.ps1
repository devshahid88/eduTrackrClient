# PowerShell script to convert all JSX files to TSX files
Write-Host "Starting JSX to TSX conversion..." -ForegroundColor Green

# Get all JSX files
$jsxFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.jsx"

Write-Host "Found $($jsxFiles.Count) JSX files to convert" -ForegroundColor Yellow

foreach ($file in $jsxFiles) {
    $newPath = $file.FullName -replace '\.jsx$', '.tsx'
    
    try {
        # Rename the file
        Rename-Item -Path $file.FullName -NewName $newPath
        Write-Host "Converted: $($file.Name) -> $($file.BaseName).tsx" -ForegroundColor Green
    }
    catch {
        Write-Host "Error converting $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "JSX to TSX conversion completed!" -ForegroundColor Green 