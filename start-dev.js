#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Try starting on different ports
const ports = [8083, 8084, 8085, 8086];

const startExpo = (portIndex) => {
  if (portIndex >= ports.length) {
    console.error('Could not find an available port');
    process.exit(1);
  }

  const port = ports[portIndex];
  console.log(`\nAttempting to start on port ${port}...\n`);

  const expo = spawn('npx', ['expo', 'start', '--port', port.toString()], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true,
  });

  expo.on('error', (err) => {
    console.error(`Error on port ${port}:`, err.message);
    startExpo(portIndex + 1);
  });

  expo.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Expo exited with code ${code} on port ${port}`);
      startExpo(portIndex + 1);
    }
  });
};

startExpo(0);
