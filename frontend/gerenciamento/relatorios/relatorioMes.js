// relatorioMes.js
// Ajuste a base da API se necessário (ex: 'http://localhost:3000')
const API_BASE = ''; // '' significa mesmo host/origem
const ENDPOINT_MES_TOP = API_BASE + '/relatorio_flores/mes-mais-vendas';
const ENDPOINT_TODOS_MESES = API_BASE + '/relatorio_flores/todos-os-meses';

const ctx = document.getElementById('chartMes').getContext('2d');
let chart = null;

document.getElementById('refreshBtnMes').addEventListener('click', init);

async function init(){
  try{
    setLoading(true);
    const [topRes, allRes] = await Promise.all([
      fetch(ENDPOINT_MES_TOP),
      fetch(ENDPOINT_TODOS_MESES)
    ]);
    if(!topRes.ok || !allRes.ok) throw new Error('Falha na requisição');

    const top = await topRes.json();
    const all = await allRes.json();

    renderTopMonth(top);
    renderChart(all);
  }catch(err){
    console.error('Erro ao carregar relatório de meses:', err);
    alert('Erro ao carregar dados. Veja o console para mais detalhes.');
  }finally{
    setLoading(false);
  }
}

function renderTopMonth(data){
  if(!data || Object.keys(data).length === 0){
    document.getElementById('mesTop').textContent = 'Nenhum registro';
    document.getElementById('mesTopCount').textContent = '';
    return;
  }
  const mes = data.mes ?? data.nome ?? '—';
  const total = data.total ?? data.quantidade ?? 0;
  document.getElementById('mesTop').textContent = capitalize(mes);
  document.getElementById('mesTopCount').textContent = `${total} venda(s)`;
}

function renderChart(items){
  const labels = (items || []).map(r => (r.mes ?? r.mes_nome ?? '—'));
  const values = (items || []).map(r => Number(r.total ?? r.quantidade ?? 0));

  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Vendas por mês',
        data: values,
        fill: true,
        backgroundColor: 'rgba(42,127,98,0.12)',
        borderColor: 'rgba(42,127,98,0.95)',
        tension: 0.2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

function setLoading(isLoading){
  const btn = document.getElementById('refreshBtnMes');
  btn.disabled = isLoading;
  btn.textContent = isLoading ? 'Carregando...' : 'Atualizar';
}

function capitalize(s){ if(!s) return s; return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

// inicializa
init();