const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const modal = document.querySelector('#subscriptionModal');
const toast = document.querySelector('#toast');
let toastTimer;
let paperEngineTimer;
let paperEngineRunning = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function enterWorkspace(label) {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  const userEmail = document.querySelector('#emailInput').value || 'demo@asteria.ai';
  document.querySelector('#profileButton').textContent = userEmail.slice(0, 2).toUpperCase();
  showToast(label === 'demo' ? 'Demo workspace ready. Paper engine is active.' : 'Workspace unlocked in paper mode.');
}

document.querySelector('#loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  enterWorkspace('login');
});

document.querySelector('#demoButton').addEventListener('click', () => enterWorkspace('demo'));
document.querySelector('#downloadButton').addEventListener('click', () => showToast('Download package prepared. APK builds require a signed mobile release pipeline.'));
document.querySelector('#upgradeLink').addEventListener('click', () => modal.classList.remove('hidden'));
document.querySelector('#closeModal').addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.classList.add('hidden');
});

document.querySelectorAll('.plan-card').forEach((plan) => {
  plan.addEventListener('click', () => {
    showToast(`${plan.dataset.plan} selected. Secure crypto checkout will open from the server.`);
    modal.classList.add('hidden');
  });
});

document.querySelector('#scanButton').addEventListener('click', () => {
  const count = document.querySelector('#opportunityCount');
  count.textContent = String(Number(count.textContent) + 1).padStart(2, '0');
  document.querySelector('#lastUpdate').textContent = 'just now';
  runPaperDecision();
  showToast('Market scan complete. One new paper opportunity found.');
});

function runPaperDecision() {
  const routes = [
    { name: 'Triangular route', route: 'BTC → ETH → SOL → USDT', icon: '△', type: 'tri', spread: 0.84 },
    { name: 'Cross-exchange spread', route: 'ETH / USDT · Coinbase → Binance', icon: '⇄', type: 'cross', spread: 0.62 },
    { name: 'Triangular route', route: 'SOL → USDC → USDT', icon: '△', type: 'tri', spread: 0.41 }
  ];
  const candidate = routes[Math.floor(Math.random() * routes.length)];
  const volatility = 0.12 + Math.random() * 0.16;
  const takeProfit = Math.max(0.18, Math.min(candidate.spread * 0.68, 0.72));
  const stopLoss = Math.max(0.09, Math.min(volatility * 0.42, takeProfit * 0.48));
  const confidence = Math.round(82 + Math.random() * 14);
  const now = new Date();
  document.querySelector('#decisionIcon').textContent = candidate.icon;
  document.querySelector('#decisionIcon').className = `strategy-icon ${candidate.type}`;
  document.querySelector('#decisionName').textContent = `${candidate.name} · PAPER BUY`;
  document.querySelector('#decisionRoute').textContent = `${candidate.route} · spread ${candidate.spread.toFixed(2)}%`;
  document.querySelector('#takeProfit').textContent = `+${takeProfit.toFixed(2)}%`;
  document.querySelector('#stopLoss').textContent = `-${stopLoss.toFixed(2)}%`;
  document.querySelector('#decisionConfidence').textContent = `${confidence}%`;
  document.querySelector('#decisionTime').textContent = `${now.toISOString().slice(11, 19)} UTC`;
  document.querySelector('#confidenceValue').textContent = `${confidence}.0%`;
  document.querySelector('#engineMessage').textContent = paperEngineRunning ? 'Paper engine scored a route and opened a simulated position within configured limits.' : 'One paper opportunity scored. Start the engine to continue autonomous analysis.';
}

document.querySelector('#autonomyToggle').addEventListener('click', () => {
  paperEngineRunning = !paperEngineRunning;
  const toggle = document.querySelector('#autonomyToggle');
  const mode = document.querySelector('#engineMode');
  if (paperEngineRunning) {
    mode.textContent = 'RUNNING / PAPER';
    mode.style.color = 'var(--lime)';
    toggle.innerHTML = 'Pause paper engine <span>Ⅱ</span>';
    runPaperDecision();
    paperEngineTimer = setInterval(runPaperDecision, 8000);
    showToast('Autonomous paper engine started. Live execution remains locked.');
  } else {
    mode.textContent = 'PAUSED';
    mode.style.color = 'var(--orange)';
    toggle.innerHTML = 'Start paper engine <span>→</span>';
    clearInterval(paperEngineTimer);
    document.querySelector('#engineMessage').textContent = 'Paper engine paused. No live orders were submitted.';
    showToast('Paper engine paused.');
  }
});

const titles = { overview: ['Command center', 'A calm view of the market signals worth your attention.'], triangular: ['Triangular arbitrage', 'Route analysis across three pairs on one exchange.'], cross: ['Cross-exchange', 'Venue comparison, depth checks, and spread monitoring.'], activity: ['Activity log', 'Every paper signal and simulated action, in one place.'], connections: ['Connections', 'Exchange credentials and AI model boundaries.'], risk: ['Risk controls', 'Guardrails for sizing, exposure, and execution mode.'] };
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
    const [title, subtitle] = titles[item.dataset.view];
    document.querySelector('#pageTitle').textContent = title;
    document.querySelector('#pageSubtitle').textContent = subtitle;
  });
});

document.querySelectorAll('[data-launch]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.launch;
    document.querySelector(`[data-view="${target}"]`).click();
  });
});
document.querySelectorAll('.opportunity-row').forEach((row) => {
  row.addEventListener('click', () => document.querySelector(`[data-view="${row.dataset.strategy}"]`).click());
});
document.querySelectorAll('[data-view-target]').forEach((button) => {
  button.addEventListener('click', () => document.querySelector(`[data-view="${button.dataset.viewTarget}"]`).click());
});
document.querySelectorAll('.chart-range').forEach((range) => range.addEventListener('click', () => {
  document.querySelectorAll('.chart-range').forEach((item) => item.classList.remove('active'));
  range.classList.add('active');
  showToast(`Signal landscape set to ${range.textContent} window.`);
}));
setInterval(() => {
  const now = new Date();
  document.querySelector('#clock').textContent = `${now.toISOString().slice(11, 19)} UTC`;
}, 1000);