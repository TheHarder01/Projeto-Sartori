#!/usr/bin/env node
const { spawn, execSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function printCodespacesHints() {
  const name = process.env.CODESPACE_NAME;
  if (!name) return;

  console.log('[up] GitHub Codespaces detectado. Abra pelas URLs encaminhadas:');
  console.log(`[up] Frontend:    https://${name}-8080.app.github.dev`);
  console.log(`[up] API:         https://${name}-7070.app.github.dev`);
  console.log(`[up] API Health:  https://${name}-7070.app.github.dev/api/health`);
  console.log('[up] Evite localhost no navegador da sua máquina local.');
}

function printStorageHint() {
  const dataDir = path.join(os.homedir(), 'Downloads', 'SartoriOdontoDados');
  console.log(`[up] Dados salvos em: ${dataDir}`);
}

function safeExec(command) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function restartStaleProcesses() {
  if (isWin) {
    // Melhor esforço para ambiente Windows.
    safeExec('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *server.js*"');
    return;
  }

  const patterns = [
    'node server.js',
    'vite --host 0.0.0.0 --port 8080',
    'npm --prefix src run dev -- --host 0.0.0.0 --port 8080',
  ];

  patterns.forEach((pattern) => {
    const killed = safeExec(`pkill -f "${pattern}"`);
    if (killed) {
      console.log(`[up] Processo antigo finalizado: ${pattern}`);
    }
  });
}

function run(name, args) {
  const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', (error) => {
    console.error(`[up] Failed to start ${name}:`, error.message);
    process.exitCode = 1;
  });

  return child;
}

printCodespacesHints();
printStorageHint();
restartStaleProcesses();

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
      proc.kill(isWin ? undefined : 'SIGTERM');
    }
  });

  setTimeout(() => process.exit(process.exitCode ?? 0), 500);
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
