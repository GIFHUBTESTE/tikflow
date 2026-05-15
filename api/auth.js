// ══════════════════════════════════════════════════════════
// TIKFLOW — API OAuth (Vercel Serverless Function)
// Arquivo: api/auth.js
// Rotas:
//   GET  /api/auth?action=login          → inicia OAuth
//   GET  /api/auth?action=callback       → recebe code do TikTok
//   POST /api/auth?action=generate-link  → gera link pra AdsPower
//   GET  /api/auth?action=accounts       → lista contas salvas
// ══════════════════════════════════════════════════════════

const https = require('https');

const {
  TIKTOK_APP_ID,
  TIKTOK_APP_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE,
  APP_URL,
} = process.env;

// ── Helpers ──────────────────────────────────────────────

function jsonPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u    = new URL(url);
    const req  = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function jsonGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({ hostname: u.hostname, path: u.pathname + u.search, headers }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    }).on('error', reject);
  });
}

// Salva conta no Supabase via REST API
async function saveAccount(advertiser_id, access_token, nick, source) {
  const url  = `${SUPABASE_URL}/rest/v1/tiktok_accounts`;
  const body = { advertiser_id, access_token, name: nick || null, source: source || 'direct', status: 'active', connected_at: new Date().toISOString() };
  const data = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const u   = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(data),
        'apikey':         SUPABASE_SERVICE,
        'Authorization':  `Bearer ${SUPABASE_SERVICE}`,
        'Prefer':         'resolution=merge-duplicates',
      },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(raw));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Busca contas do Supabase
async function getAccounts() {
  const url = `${SUPABASE_URL}/rest/v1/tiktok_accounts?status=eq.active&select=*`;
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({
      hostname: u.hostname, path: u.pathname + u.search,
      headers: { 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}` },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve([]); } });
    }).on('error', reject);
  });
}

// ── Handler Principal ────────────────────────────────────

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // ── LOGIN → inicia OAuth ────────────────────────────────
  if (action === 'login') {
    const source = req.query.source || 'direct';
    const state  = Buffer.from(JSON.stringify({
      source, ts: Date.now(), r: Math.random().toString(36).slice(2),
    })).toString('base64url');

    const redirectUri = encodeURIComponent(`${APP_URL}/api/auth?action=callback`);
    const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${TIKTOK_APP_ID}&redirect_uri=${redirectUri}&state=${state}`;
    return res.redirect(302, authUrl);
  }

  // ── CALLBACK → recebe code do TikTok ───────────────────
  if (action === 'callback') {
    const { code, state, error } = req.query;

    if (error || !code) {
      return res.redirect(302, `${APP_URL}/connect?error=${error || 'denied'}`);
    }

    // Decodifica state
    let stateData = {};
    try { stateData = JSON.parse(Buffer.from(state || '', 'base64url').toString()); } catch {}

    // Troca code por access_token
    const tokenData = await jsonPost(
      'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
      { app_id: TIKTOK_APP_ID, secret: TIKTOK_APP_SECRET, auth_code: code }
    );

    if (tokenData.code !== 0) {
      console.error('TikTok token error:', tokenData);
      return res.redirect(302, `${APP_URL}/connect?error=token_failed`);
    }

    const { access_token, advertiser_ids } = tokenData.data;
    const nick   = stateData.nick || null;
    const source = stateData.source || 'direct';

    // Salva cada conta no Supabase
    for (const id of advertiser_ids) {
      await saveAccount(id, access_token, nick, source);
    }

    const idsParam = advertiser_ids.join(',');
    return res.redirect(302,
      `${APP_URL}/connect?connected=true&accounts=${advertiser_ids.length}&advertiser_ids=${idsParam}&source=${source}`
    );
  }

  // ── GENERATE-LINK → gera URL OAuth com state único ─────
  if (action === 'generate-link' && req.method === 'POST') {
    let body = '';
    await new Promise(r => { req.on('data', c => body += c); req.on('end', r); });
    const { nick, expires_in = 1800 } = JSON.parse(body || '{}');

    const state = Buffer.from(JSON.stringify({
      nick:   nick || null,
      source: 'adspower',
      ts:     Date.now(),
      exp:    Date.now() + expires_in * 1000,
      r:      Math.random().toString(36).slice(2),
    })).toString('base64url');

    const redirectUri = encodeURIComponent(`${APP_URL}/api/auth?action=callback`);
    const link = `https://business-api.tiktok.com/portal/auth?app_id=${TIKTOK_APP_ID}&redirect_uri=${redirectUri}&state=${state}`;

    return res.status(200).json({ link, state, expires_in });
  }

  // ── ACCOUNTS → lista contas conectadas ─────────────────
  if (action === 'accounts') {
    const accounts = await getAccounts();
    return res.status(200).json({ accounts });
  }

  // ── TOGGLE CAMPAIGN ────────────────────────────────────
  if (action === 'toggle-campaign' && req.method === 'POST') {
    let body = '';
    await new Promise(r => { req.on('data', c => body += c); req.on('end', r); });
    const { advertiser_id, campaign_id, operation_status } = JSON.parse(body || '{}');

    // Busca token da conta
    const accounts = await getAccounts();
    const acc = accounts.find(a => a.advertiser_id === advertiser_id);
    if (!acc) return res.status(404).json({ error: 'Conta não encontrada' });

    const result = await jsonPost(
      'https://business-api.tiktok.com/open_api/v1.3/campaign/status/update/',
      { advertiser_id, campaign_ids: [campaign_id], operation_status }
    );
    // Injeta o access_token no header
    // (a versão completa passa o token via header na chamada real)
    return res.status(200).json(result);
  }

  return res.status(404).json({ error: 'Rota não encontrada' });
};
