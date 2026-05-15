// ═══ MOCK DATA ENGINE ═══

const statuses = ['ONLINE', 'LIMITADA', 'RISCO', 'BLOQUEADA', 'SEM SALDO'];
const countries = ['US', 'BR', 'UK', 'DE', 'FR', 'JP', 'CA', 'AU', 'MX', 'ES', 'IT', 'NL', 'KR', 'IN', 'PH'];
const currencies = { US: 'USD', BR: 'BRL', UK: 'GBP', DE: 'EUR', FR: 'EUR', JP: 'JPY', CA: 'CAD', AU: 'AUD', MX: 'MXN', ES: 'EUR', IT: 'EUR', NL: 'EUR', KR: 'KRW', IN: 'INR', PH: 'PHP' };
const objectives = ['Conversions', 'Traffic', 'App Install', 'Video Views', 'Lead Gen', 'Reach'];
const audiences = ['Women 18-34', 'Men 25-44', 'Women 25-54', 'All 18-65', 'Men 18-34', 'Women 35-54'];
const niches = ['Beauty', 'Fashion', 'Tech', 'Health', 'Finance', 'Gaming', 'Food', 'Fitness', 'Education', 'Ecommerce'];

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }
function pick(arr) { return arr[randInt(0, arr.length)]; }
function id() { return Math.random().toString(36).substr(2, 12); }

// ═══ ACCOUNTS ═══
export const accounts = Array.from({ length: 20 }, (_, i) => {
  const country = countries[i % countries.length];
  const st = i < 12 ? 'ONLINE' : pick(statuses);
  return {
    id: id(),
    name: `TK Ads ${country}-${String(i + 1).padStart(2, '0')}`,
    tikTokId: `7${randInt(100000000, 999999999)}`,
    country,
    currency: currencies[country] || 'USD',
    balance: parseFloat(rand(50, 15000).toFixed(2)),
    dailyLimit: parseFloat(rand(500, 5000).toFixed(0)),
    status: st,
    spending: parseFloat(rand(100, 8000).toFixed(2)),
    activeCampaigns: randInt(2, 35),
    totalSpent: parseFloat(rand(5000, 150000).toFixed(2)),
  };
});

// ═══ CAMPAIGNS ═══
export const campaigns = Array.from({ length: 120 }, (_, i) => {
  const acc = pick(accounts);
  const obj = pick(objectives);
  const aud = pick(audiences);
  const niche = pick(niches);
  const spend = parseFloat(rand(10, 5000).toFixed(2));
  const revenue = parseFloat((spend * rand(0.5, 5)).toFixed(2));
  const impressions = randInt(5000, 500000);
  const clicks = Math.floor(impressions * rand(0.01, 0.06));
  const conversions = Math.floor(clicks * rand(0.02, 0.15));
  const cstatus = i < 70 ? 'active' : i < 90 ? 'paused' : i < 105 ? 'learning' : 'error';
  return {
    id: id(),
    name: `${obj} - ${acc.country} - ${aud} - ${niche}`,
    accountId: acc.id,
    accountName: acc.name,
    status: cstatus,
    objective: obj,
    audience: aud,
    niche,
    budget: parseFloat(rand(20, 2000).toFixed(2)),
    spend,
    revenue,
    roas: parseFloat((revenue / spend).toFixed(2)),
    impressions,
    clicks,
    conversions,
    ctr: parseFloat((clicks / impressions * 100).toFixed(2)),
    cpc: parseFloat((spend / clicks).toFixed(2)),
    cpm: parseFloat((spend / impressions * 1000).toFixed(2)),
    cpa: conversions > 0 ? parseFloat((spend / conversions).toFixed(2)) : 0,
    frequency: parseFloat(rand(1, 4).toFixed(1)),
    createdAt: new Date(Date.now() - randInt(1, 60) * 86400000).toISOString(),
  };
});

// ═══ PIXELS ═══
export const pixels = Array.from({ length: 15 }, (_, i) => ({
  id: id(),
  name: `Pixel ${pick(niches)} ${i + 1}`,
  pixelId: `C${randInt(1000000, 9999999)}`,
  status: i < 11 ? 'active' : 'inactive',
  events: randInt(500, 50000),
  lastFired: new Date(Date.now() - randInt(0, 72) * 3600000).toISOString(),
  accountId: accounts[i % accounts.length].id,
}));

// ═══ CREATIVES ═══
export const creatives = Array.from({ length: 40 }, (_, i) => ({
  id: id(),
  name: `Creative_${pick(niches)}_${i + 1}.mp4`,
  type: i < 30 ? 'video' : 'image',
  size: `${randInt(2, 50)}MB`,
  duration: i < 30 ? `${randInt(10, 60)}s` : null,
  status: i < 35 ? 'approved' : 'pending',
  impressions: randInt(1000, 200000),
  ctr: parseFloat(rand(1, 6).toFixed(2)),
  uploadedAt: new Date(Date.now() - randInt(1, 30) * 86400000).toISOString(),
}));

// ═══ TEMPLATES ═══
export const templates = Array.from({ length: 10 }, (_, i) => ({
  id: id(),
  name: `Template ${pick(niches)} ${pick(objectives)}`,
  objective: pick(objectives),
  audience: pick(audiences),
  budget: parseFloat(rand(50, 1000).toFixed(0)),
  countries: [pick(countries), pick(countries)],
  cta: pick(['Shop Now', 'Learn More', 'Sign Up', 'Download', 'Buy Now']),
  usageCount: randInt(5, 100),
  createdAt: new Date(Date.now() - randInt(1, 90) * 86400000).toISOString(),
}));

// ═══ AUTOMATIONS ═══
export const automations = Array.from({ length: 12 }, (_, i) => ({
  id: id(),
  name: [
    'Pausar CPA Alto', 'Escalar ROAS > 3', 'Pausar CTR Baixo', 'Duplicar Vencedoras',
    'Trocar Criativo Fadigado', 'Aumentar Budget Top 10', 'Pausar Sem Conversão 24h',
    'Reativar CPA Melhorado', 'Limitar Gasto Diário', 'Escalar Novas Contas',
    'Pausar Frequência Alta', 'Otimizar Budget Automático',
  ][i],
  condition: ['CPA > $30', 'ROAS > 3.0', 'CTR < 1%', 'ROAS > 2.5', 'Freq > 3', 'Top 10 ROAS', 'Conv = 0 (24h)', 'CPA dropped 20%', 'Spend > $500', 'New accounts', 'Freq > 3.5', 'Daily budget'][i],
  action: ['pause', 'scale', 'pause', 'duplicate', 'swap_creative', 'increase_budget', 'pause', 'activate', 'limit', 'scale', 'pause', 'adjust'][i],
  enabled: i < 8,
  executions: randInt(10, 500),
  lastRun: new Date(Date.now() - randInt(0, 48) * 3600000).toISOString(),
}));

// ═══ LOGS ═══
const logTypes = ['campaign', 'api', 'ai', 'error', 'upload', 'worker', 'account'];
const logMessages = [
  'Campaign created: Conversions - US - Women 25-34',
  'API request successful: GET /campaigns',
  'AI detected creative fatigue on campaign #4521',
  'Rate limit warning: Account TK-US-03',
  'Creative uploaded: video_beauty_12.mp4',
  'Worker #3 completed queue batch (15 tasks)',
  'Account TK-BR-01 balance updated: $2,340.50',
  'Campaign paused by automation: CPA > $30',
  'AI recommendation: Scale campaign #2891 (ROAS 4.2)',
  'Error 429: Rate limit exceeded on account TK-DE-02',
  'Bulk creation completed: 30 campaigns created',
  'Pixel event received: Purchase ($89.99)',
  'Worker #1 processing campaign creation queue',
  'Account TK-UK-04 status changed: ONLINE → LIMITADA',
  'AI optimized budgets across 12 campaigns',
];

export const logs = Array.from({ length: 100 }, (_, i) => ({
  id: id(),
  type: pick(logTypes),
  message: pick(logMessages),
  timestamp: new Date(Date.now() - i * randInt(30000, 300000)).toISOString(),
}));

// ═══ NOTIFICATIONS ═══
const notifTypes = ['success', 'warning', 'error', 'info'];
const notifMessages = [
  { type: 'success', msg: 'Campanha aprovada: Conversions - US Beauty' },
  { type: 'error', msg: 'Campanha rejeitada: Violação de política' },
  { type: 'warning', msg: 'Conta TK-US-03 limitada' },
  { type: 'warning', msg: 'Saldo baixo: TK-BR-01 ($45.20)' },
  { type: 'success', msg: 'Campanha escalada com sucesso (ROAS 4.2)' },
  { type: 'error', msg: 'Erro API 429: Rate limit excedido' },
  { type: 'info', msg: 'IA otimizou 8 campanhas automaticamente' },
  { type: 'success', msg: '30 campanhas criadas em massa' },
  { type: 'warning', msg: 'Fadiga criativa detectada em 3 campanhas' },
  { type: 'info', msg: 'Worker #2 processando fila de uploads' },
];

export const notifications = Array.from({ length: 30 }, (_, i) => {
  const n = pick(notifMessages);
  return { id: id(), type: n.type, message: n.msg, read: i > 5, timestamp: new Date(Date.now() - i * randInt(60000, 600000)).toISOString() };
});

// ═══ KPI SUMMARY ═══
export function getKPIs() {
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  return {
    totalSpend: totalSpend.toFixed(2),
    totalRevenue: totalRevenue.toFixed(2),
    roas: (totalRevenue / totalSpend).toFixed(2),
    totalConversions,
    activeCampaigns,
    totalAccounts: accounts.length,
    onlineAccounts: accounts.filter(a => a.status === 'ONLINE').length,
    avgCTR: (campaigns.reduce((s, c) => s + c.ctr, 0) / campaigns.length).toFixed(2),
    avgCPC: (campaigns.reduce((s, c) => s + c.cpc, 0) / campaigns.length).toFixed(2),
    avgCPM: (campaigns.reduce((s, c) => s + c.cpm, 0) / campaigns.length).toFixed(2),
    profit: (totalRevenue - totalSpend).toFixed(2),
  };
}

// ═══ CHART DATA ═══
export function getRevenueChartData() {
  const labels = [];
  const revenue = [];
  const spend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
    revenue.push(parseFloat(rand(3000, 18000).toFixed(0)));
    spend.push(parseFloat(rand(1500, 8000).toFixed(0)));
  }
  return { labels, revenue, spend };
}

export function getMetricsChartData() {
  const labels = [];
  const roas = [], ctr = [], cpc = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
    roas.push(parseFloat(rand(1.5, 5).toFixed(2)));
    ctr.push(parseFloat(rand(1.5, 5).toFixed(2)));
    cpc.push(parseFloat(rand(0.3, 2).toFixed(2)));
  }
  return { labels, roas, ctr, cpc };
}
