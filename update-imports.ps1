# PowerShell script to update all import statements from .jsx to .tsx
Write-Host "Starting import statement updates..." -ForegroundColor Green

# Get all TypeScript/JavaScript files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts", "*.js" | Where-Object { $_.Name -notlike "*.d.ts" }

Write-Host "Found $($files.Count) files to update" -ForegroundColor Yellow

$updatedFiles = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Update import statements from .jsx to .tsx
    $content = $content -replace 'from ["'']([^"'']+)\.jsx["'']', 'from "$1.tsx"'
    $content = $content -replace 'import ["'']([^"'']+)\.jsx["'']', 'import "$1.tsx"'
    
    # Update require statements from .jsx to .tsx
    $content = $content -replace 'require\(["'']([^"'']+)\.jsx["'']\)', 'require("$1.tsx")'
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated imports in: $($file.Name)" -ForegroundColor Green
        $updatedFiles++
    }
}

Write-Host "Updated $updatedFiles files with new import statements!" -ForegroundColor Green 