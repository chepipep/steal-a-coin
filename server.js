// Simple HTTP Server for Steal A ShitCoin
// Run with: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

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
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`  -> 404 Not Found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                console.log(`  -> 500 Server Error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            console.log(`  -> 200 OK: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('=================================');
    console.log('   STEAL A SHITCOIN');
    console.log('   Pixel Crypto Heist');
    console.log('=================================');
    console.log('');
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('');
    console.log('Open this URL in your browser to play!');
    console.log('Press Ctrl+C to stop the server.');
    console.log('');

    // Try to open browser automatically
    const { exec } = require('child_process');
    const url = `http://localhost:${PORT}`;

    switch (process.platform) {
        case 'win32':
            exec(`start ${url}`);
            break;
        case 'darwin':
            exec(`open ${url}`);
            break;
        default:
            exec(`xdg-open ${url}`);
    }
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use!`);
        console.error('Try closing other applications or change the PORT in server.js');
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
