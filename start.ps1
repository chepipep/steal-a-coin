# STEAL A SHITCOIN - Pixel Crypto Heist
# PowerShell Launch Script

Write-Host "=================================" -ForegroundColor Yellow
Write-Host "   STEAL A SHITCOIN" -ForegroundColor Cyan
Write-Host "   Pixel Crypto Heist" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check for Python
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if ($pythonCmd) {
    Write-Host "Found Python! Starting server on http://localhost:8000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    Start-Process "http://localhost:8000"
    & $pythonCmd -m http.server 8000
} else {
    # Check for Node.js
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Host "Found Node.js! Starting server on http://localhost:8000" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        Start-Process "http://localhost:8000"

        # Inline Node.js server
        $nodeCode = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(8000, () => {
    console.log('Server running at http://localhost:8000/');
});
"@
        $nodeCode | node
    } else {
        Write-Host "No Python or Node.js found." -ForegroundColor Red
        Write-Host "Opening game directly in browser (some features may not work)..." -ForegroundColor Yellow
        Start-Process "$scriptPath\index.html"
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
