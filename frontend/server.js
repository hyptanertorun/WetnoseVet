// Production server for Next.js standalone deployment on Emergent
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Set hostname and port
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Check for standalone server
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServerPath = path.join(standaloneDir, 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.error('ERROR: Standalone server not found at:', standaloneServerPath);
  console.error('Please run: yarn build');
  process.exit(1);
}

// Set the directory for Next.js to find static files
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify({
  distDir: '.next'
});

// Change to standalone directory and start the server
process.chdir(standaloneDir);

console.log('Starting Next.js standalone server...');
console.log('Server directory:', standaloneDir);
console.log('Hostname:', hostname);
console.log('Port:', port);

// Require and start the standalone server
require(standaloneServerPath);
