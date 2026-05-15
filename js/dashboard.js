// Exibir Toasts
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Modal Logic
function openCampaignModal() {
  document.getElementById('campaign-modal').classList.add('active');
}

function closeCampaignModal() {
  document.getElementById('campaign-modal').classList.remove('active');
}

let activeAccountsCount = 0;

// Carregar contas da API
async function loadAccounts() {
  try {
    const res = await fetch('/api/auth?action=accounts');
    const data = await res.json();
    
    let accounts = data.accounts || [];

    // --- MOCK DE DADOS PARA VISUALIZAÇÃO ---
    // Se não tiver contas no backend real (ou para demonstrar a UI completa pedida pelo usuário), vamos mockar os status e saldos.
    if (accounts.length === 0) {
      accounts = [
        { advertiser_id: '715243881923012', name: 'ProfileAds 01', source: 'direct', status: 'active' },
        { advertiser_id: '719381203912033', name: 'ProfileAds 02', source: 'adspower', status: 'suspended' },
        { advertiser_id: '720391823012933', name: 'ProfileAds 03', source: 'dolphin', status: 'active' },
        { advertiser_id: '702931823019238', name: 'ProfileAds 04', source: 'direct', status: 'blocked' }
      ];
    } else {
      // Misturar status mockados apenas para efeito de painel, já que a API não retornou tudo ainda.
      const statuses = ['active', 'active', 'suspended', 'blocked'];
      accounts = accounts.map((acc, i) => ({
        ...acc,
        status: acc.status || statuses[i % statuses.length]
      }));
    }
    // ---------------------------------------

    const tbody = document.getElementById('accounts-tbody');
    tbody.innerHTML = '';

    let totalActive = 0;
    let totalBlocked = 0;
    let totalBalance = 0;

    accounts.forEach(acc => {
      // Mock random balance per account
      const balance = acc.status === 'active' ? (Math.random() * 500 + 50).toFixed(2) : '0.00';
      if(acc.status === 'active') { totalActive++; totalBalance += parseFloat(balance); }
      if(acc.status === 'blocked') totalBlocked++;

      const tr = document.createElement('tr');
      
      let statusBadge = '';
      if(acc.status === 'active') statusBadge = '<span class="badge badge-active">Ativa</span>';
      else if(acc.status === 'suspended') statusBadge = '<span class="badge badge-suspended">Suspensa</span>';
      else if(acc.status === 'blocked') statusBadge = '<span class="badge badge-blocked">Bloqueada</span>';
      else statusBadge = `<span class="badge">${acc.status}</span>`;

      tr.innerHTML = `
        <td style="font-family: monospace; color: var(--primary-color);">${acc.advertiser_id}</td>
        <td>${acc.name || 'Conta sem nome'} <br><span style="font-size: 0.75rem; color: var(--text-muted)">via ${acc.source}</span></td>
        <td>${statusBadge}</td>
        <td style="font-weight: 600;">$${balance}</td>
        <td>
          <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" ${acc.status !== 'active' ? 'disabled' : ''}>
            Sincronizar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    activeAccountsCount = totalActive;

    // Atualizar stats
    document.getElementById('stat-total-accounts').innerText = accounts.length;
    document.getElementById('stat-active-accounts').innerText = totalActive;
    document.getElementById('stat-blocked-accounts').innerText = totalBlocked;
    document.getElementById('stat-total-balance').innerText = `$${totalBalance.toFixed(2)}`;

  } catch (err) {
    document.getElementById('accounts-tbody').innerHTML = `
      <tr><td colspan="5" class="text-center text-danger">Erro ao carregar contas.</td></tr>
    `;
    showToast('Erro ao buscar as contas do TikTok.', 'error');
  }
}

// Submeter campanha em massa
function submitMassCampaign() {
  if(activeAccountsCount === 0) {
    showToast('Você não possui contas ativas para postar.', 'error');
    return;
  }

  const btn = document.getElementById('btn-submit-campaign');
  btn.innerText = 'Iniciando publicações...';
  btn.disabled = true;

  // Simulando processo de criação de campanha
  let progress = 0;
  const interval = setInterval(() => {
    progress++;
    btn.innerText = `Publicando... (${progress}/${activeAccountsCount} contas)`;
    
    if (progress >= activeAccountsCount) {
      clearInterval(interval);
      btn.innerText = 'Lançar em Todas as Contas';
      btn.disabled = false;
      closeCampaignModal();
      showToast(`Campanha criada em ${activeAccountsCount} contas com sucesso!`, 'success');
    }
  }, 800); // delay fake de API
}

// Inicializar
window.addEventListener('DOMContentLoaded', loadAccounts);
