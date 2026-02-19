const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 7070);

const STATUS = {
  indicado: 'indicado',
  atendido: 'atendido',
  fechado: 'fechado',
};

function getNativeUsername() {
  return os.userInfo().username;
}

function getDownloadsFolder() {
  const home = os.homedir();
  return path.join(home, 'Downloads', 'SartoriOdontoDados');
}

const dataDir = getDownloadsFolder();
const files = {
  patients: path.join(dataDir, 'pacientes.json'),
  referrals: path.join(dataDir, 'indicacoes.json'),
  rankingMonthly: path.join(dataDir, 'ranking_mensal.json'),
  rankingAll: path.join(dataDir, 'ranking_all.json'),
};

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const text = fs.readFileSync(file, 'utf8');
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function jsonResponse(res, code, payload) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error('Payload muito grande'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function calculateScores(patients, referrals, month, year) {
  const byPatient = new Map();
  for (const p of patients) {
    byPatient.set(p.id, {
      patientId: p.id,
      patientName: p.name,
      totalReferrals: 0,
      attended: 0,
      converted: 0,
      points: 0,
    });
  }

  const filtered = referrals.filter((r) => {
    if (month === undefined || year === undefined) return true;
    const d = new Date(r.createdAt);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  for (const r of filtered) {
    const score = byPatient.get(r.referrerId);
    if (!score) continue;
    score.totalReferrals += 1;
    if (r.status === STATUS.atendido) {
      score.attended += 1;
      score.points += 1;
    }
    if (r.status === STATUS.fechado) {
      score.converted += 1;
      score.points += 31;
    }
  }

  return Array.from(byPatient.values())
    .filter((s) => s.totalReferrals > 0)
    .sort((a, b) => b.points - a.points || b.converted - a.converted || b.attended - a.attended || b.totalReferrals - a.totalReferrals || a.patientName.localeCompare(b.patientName));
}

function updateRankingFiles() {
  const patients = readJson(files.patients, []);
  const referrals = readJson(files.referrals, []);

  const now = new Date();
  const monthly = calculateScores(patients, referrals, now.getMonth(), now.getFullYear());
  const all = calculateScores(patients, referrals);

  writeJson(files.rankingMonthly, {
    key: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    generatedAt: new Date().toISOString(),
    data: monthly,
  });

  writeJson(files.rankingAll, {
    generatedAt: new Date().toISOString(),
    data: all,
  });
}

function getLocalNetworkIPs() {
  const ifaces = os.networkInterfaces();
  const ips = [];
  Object.keys(ifaces).forEach((name) => {
    for (const net of ifaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  });
  return ips;
}

ensureDataDir();
if (!fs.existsSync(files.patients)) writeJson(files.patients, []);
if (!fs.existsSync(files.referrals)) writeJson(files.referrals, []);
if (!fs.existsSync(files.rankingMonthly)) writeJson(files.rankingMonthly, { key: '', generatedAt: '', data: [] });
if (!fs.existsSync(files.rankingAll)) writeJson(files.rankingAll, { generatedAt: '', data: [] });
updateRankingFiles();

const server = http.createServer(async (req, res) => {
  if (!req.url) return jsonResponse(res, 400, { error: 'URL inválida' });
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    return jsonResponse(res, 200, {
      ok: true,
      username: getNativeUsername(),
      dataDir,
      files,
    });
  }

  if (url.pathname === '/api/pacientes' && req.method === 'GET') {
    return jsonResponse(res, 200, readJson(files.patients, []));
  }

  if (url.pathname === '/api/pacientes' && req.method === 'POST') {
    try {
      const body = await getBody(req);
      if (!body.name || !String(body.name).trim()) return jsonResponse(res, 400, { error: 'Nome é obrigatório' });
      const all = readJson(files.patients, []);
      const patient = {
        id: uid(),
        name: String(body.name || ''),
        phone: String(body.phone || ''),
        email: String(body.email || ''),
        cpf: String(body.cpf || ''),
        birthDate: String(body.birthDate || ''),
        address: String(body.address || ''),
        notes: String(body.notes || ''),
        createdAt: new Date().toISOString(),
      };
      all.push(patient);
      writeJson(files.patients, all);
      updateRankingFiles();
      return jsonResponse(res, 201, patient);
    } catch (e) {
      return jsonResponse(res, 400, { error: e.message });
    }
  }

  if (url.pathname.startsWith('/api/pacientes/') && req.method === 'PUT') {
    try {
      const id = url.pathname.split('/').pop();
      const body = await getBody(req);
      const all = readJson(files.patients, []);
      const idx = all.findIndex((p) => p.id === id);
      if (idx < 0) return jsonResponse(res, 404, { error: 'Paciente não encontrado' });
      all[idx] = { ...all[idx], ...body, id: all[idx].id, createdAt: all[idx].createdAt };
      writeJson(files.patients, all);
      return jsonResponse(res, 200, all[idx]);
    } catch (e) {
      return jsonResponse(res, 400, { error: e.message });
    }
  }

  if (url.pathname.startsWith('/api/pacientes/') && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const patients = readJson(files.patients, []).filter((p) => p.id !== id);
    const referrals = readJson(files.referrals, []).filter((r) => r.referrerId !== id);
    writeJson(files.patients, patients);
    writeJson(files.referrals, referrals);
    updateRankingFiles();
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/indicacoes' && req.method === 'GET') {
    return jsonResponse(res, 200, readJson(files.referrals, []));
  }

  if (url.pathname === '/api/indicacoes' && req.method === 'POST') {
    try {
      const body = await getBody(req);
      if (!body.referrerId || !body.referredName) return jsonResponse(res, 400, { error: 'Indicador e nome são obrigatórios' });
      const all = readJson(files.referrals, []);
      const now = new Date().toISOString();
      const referral = {
        id: uid(),
        referrerId: String(body.referrerId),
        referredName: String(body.referredName || ''),
        referredPhone: String(body.referredPhone || ''),
        referredEmail: String(body.referredEmail || ''),
        treatmentInterest: String(body.treatmentInterest || ''),
        status: [STATUS.indicado, STATUS.atendido, STATUS.fechado].includes(body.status) ? body.status : STATUS.indicado,
        notes: String(body.notes || ''),
        createdAt: now,
        updatedAt: now,
      };
      all.push(referral);
      writeJson(files.referrals, all);
      updateRankingFiles();
      return jsonResponse(res, 201, referral);
    } catch (e) {
      return jsonResponse(res, 400, { error: e.message });
    }
  }

  if (url.pathname.startsWith('/api/indicacoes/') && req.method === 'PUT') {
    try {
      const id = url.pathname.split('/').pop();
      const body = await getBody(req);
      const all = readJson(files.referrals, []);
      const idx = all.findIndex((r) => r.id === id);
      if (idx < 0) return jsonResponse(res, 404, { error: 'Indicação não encontrada' });
      all[idx] = { ...all[idx], ...body, id: all[idx].id, updatedAt: new Date().toISOString() };
      writeJson(files.referrals, all);
      updateRankingFiles();
      return jsonResponse(res, 200, all[idx]);
    } catch (e) {
      return jsonResponse(res, 400, { error: e.message });
    }
  }

  if (url.pathname.startsWith('/api/indicacoes/') && req.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    const all = readJson(files.referrals, []).filter((r) => r.id !== id);
    writeJson(files.referrals, all);
    updateRankingFiles();
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/ranking/all' && req.method === 'GET') {
    return jsonResponse(res, 200, readJson(files.rankingAll, { generatedAt: '', data: [] }));
  }

  if (url.pathname === '/api/ranking/mensal' && req.method === 'GET') {
    const month = Number(url.searchParams.get('month'));
    const year = Number(url.searchParams.get('year'));
    const patients = readJson(files.patients, []);
    const referrals = readJson(files.referrals, []);
    const now = new Date();
    const m = Number.isInteger(month) ? month : now.getMonth();
    const y = Number.isInteger(year) ? year : now.getFullYear();
    const data = calculateScores(patients, referrals, m, y);
    return jsonResponse(res, 200, {
      key: `${y}-${String(m + 1).padStart(2, '0')}`,
      generatedAt: new Date().toISOString(),
      data,
    });
  }

  return jsonResponse(res, 404, { error: 'Rota não encontrada' });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalNetworkIPs();
  console.log(`Usuário nativo detectado: ${getNativeUsername()}`);
  console.log(`Arquivos JSON em: ${dataDir}`);
  console.log(`API escutando em: http://0.0.0.0:${PORT}`);
  ips.forEach((ip) => console.log(`API na rede local: http://${ip}:${PORT}`));
});
