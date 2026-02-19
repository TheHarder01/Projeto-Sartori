#!/usr/bin/env node
const { spawn } = require('node:child_process');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function run(name, args, options = {}) {
  const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  child.on('error', (error) => {
    console.error(`[up] Failed to start ${name}:`, error.message);
    process.exitCode = 1;
  });

  return child;
}

const api = run('api', ['run', 'api']);
const dev = run('dev', ['run', 'dev']);

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (signal) {
    console.log(`\n[up] Received ${signal}, stopping API and DEV...`);
  }

  [dev, api].forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });

  setTimeout(() => process.exit(process.exitCode ?? 0), 400);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

api.on('exit', (code) => {
  if (!shuttingDown && code !== 0) {
    process.exitCode = code ?? 1;
  }
  shutdown();
});

dev.on('exit', (code) => {
  if (!shuttingDown && code !== 0) {
    process.exitCode = code ?? 1;
  }
  shutdown();
});
