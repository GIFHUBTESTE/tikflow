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

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const statusEl = document.getElementById('status-message');
  
  if (urlParams.get('connected') === 'true') {
    const accCount = urlParams.get('accounts') || '1';
    statusEl.innerHTML = `
      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid var(--success); color: var(--success); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <strong>Sucesso!</strong> ${accCount} conta(s) conectada(s) com sucesso.
      </div>
    `;
    statusEl.classList.remove('hidden');
    showToast(`${accCount} conta(s) conectada(s)!`);
  } else if (urlParams.get('error')) {
    statusEl.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); color: var(--danger); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <strong>Erro:</strong> Falha ao conectar conta (${urlParams.get('error')}).
      </div>
    `;
    statusEl.classList.remove('hidden');
  }
});

function connectDirect() {
  window.location.href = '/api/auth?action=login&source=direct';
}

async function generateLink() {
  const btn = document.getElementById('btn-generate');
  btn.innerText = 'Gerando...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth?action=generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick: 'AdsPower Profile', expires_in: 1800 })
    });

    const data = await res.json();
    
    if (data.link) {
      document.getElementById('generate-section').classList.add('hidden');
      document.getElementById('link-section').classList.remove('hidden');
      document.getElementById('multilogin-link').value = data.link;
      showToast('Link gerado com sucesso!');
    } else {
      showToast('Erro ao gerar link', 'error');
      btn.innerText = 'Tentar Novamente';
      btn.disabled = false;
    }
  } catch (err) {
    showToast('Erro de conexão', 'error');
    btn.innerText = 'Gerar Link';
    btn.disabled = false;
  }
}

function copyLink() {
  const linkInput = document.getElementById('multilogin-link');
  linkInput.select();
  linkInput.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(linkInput.value).then(() => {
    showToast('Link copiado para a área de transferência!');
  }).catch(() => {
    showToast('Erro ao copiar link', 'error');
  });
}
