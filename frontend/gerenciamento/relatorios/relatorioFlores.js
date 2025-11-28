// relatorioFlores.js
// Ajuste a base da API se necessário (ex: 'http://localhost:3000')
const API_BASE = ''; // '' significa mesmo host/origem
const ENDPOINT = API_BASE + '/relatorio_flores/flores-mais-vendidas';

const ctx = document.getElementById('chartFlores').getContext('2d');
let chart = null;

document.getElementById('refreshBtn').addEventListener('click', init);

async function init(){
  try{
    setLoading(true);
    const res = await fetch(ENDPOINT);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderTable(data);
    renderChart(data);
  }catch(err){
    console.error('Erro ao carregar flores mais vendidas:', err);
    alert('Erro ao carregar dados. Veja o console para mais detalhes.');
  }finally{
    setLoading(false);
  }
}

function renderTable(items){
  const tbody = document.querySelector('#tableFlores tbody');
  tbody.innerHTML = '';
  if(!Array.isArray(items) || items.length === 0){
    tbody.innerHTML = '<tr><td colspan="3">Nenhum registro encontrado</td></tr>';
    return;
  }
  items.forEach((row, i) => {
    const tr = document.createElement('tr');
    const nome = row.nome ?? row.nome_flor ?? '—';
    const quantidade = row.quantidade ?? row.total ?? 0;
    tr.innerHTML = `<td>${i+1}</td><td>${escapeHtml(nome)}</td><td>${quantidade}</td>`;
    tbody.appendChild(tr);
  });
}

function renderChart(items){
  const labels = (items || []).map(r => r.nome ?? r.nome_flor ?? '—');
  const values = (items || []).map(r => Number(r.quantidade ?? r.total ?? 0));

  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quantidade',
        data: values,
        backgroundColor: labels.map((_,i) => `rgba(201,75,109,${0.9 - i*0.06})`),
        borderColor: 'rgba(201,75,109,0.9)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function setLoading(isLoading){
  const btn = document.getElementById('refreshBtn');
  btn.disabled = isLoading;
  btn.textContent = isLoading ? 'Carregando...' : 'Atualizar';
}

function escapeHtml(str){
  return String(str).replace(/[&<>"'`=/]/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#x60;','/':'&#x2F;','=':'&#x3D;'
  })[s]);
}

// carregamento inicial
init();