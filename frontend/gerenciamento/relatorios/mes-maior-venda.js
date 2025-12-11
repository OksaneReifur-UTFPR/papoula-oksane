// mes-maior-venda.js
// Requer: data.js (sales) e utils.js

// ===================================================
// NOVO: LÓGICA DE CORAÇÕES FLUTUANTES (Unificada)
// ===================================================

/**
 * Cria os corações flutuantes e laterais para o efeito visual unificado.
 */
function createHearts() {
    const floating = document.querySelector('.floating-hearts');
    const side = document.querySelector('.side-hearts');
    const heartEmojis = ['💗', '💕', '💞', '💖'];
  
    if(!floating || !side) return;
  
    floating.innerHTML = '';
    side.innerHTML = '';
  
    // Corações flutuantes centrais (Floating-Hearts)
    const floatHearts = [
      {top: '8%', left: '2%', delay: '0s'},
      {top: '15%', right: '3%', delay: '1s'},
      {top: '25%', left: '5%', delay: '2s'},
      {top: '35%', right: '7%', delay: '3s'},
      {top: '45%', left: '3%', delay: '4s'},
      {top: '55%', right: '4%', delay: '5s'},
      {top: '65%', left: '6%', delay: '1.5s'},
      {top: '75%', right: '2%', delay: '2.5s'},
      {top: '85%', left: '4%', delay: '3.5s'},
      {top: '20%', left: '8%', delay: '4.5s'},
      {top: '50%', right: '8%', delay: '0.5s'},
      {top: '70%', left: '2%', delay: '1.8s'},
    ];
    floatHearts.forEach((pos, i) => {
      const heart = document.createElement('span');
      heart.className = `heart heart-${i+1}`;
      heart.innerHTML = heartEmojis[i % heartEmojis.length];
      Object.assign(heart.style, pos);
      heart.style.animationDelay = pos.delay;
      floating.appendChild(heart);
    });
  
    // Corações laterais (Side-Hearts)
    const leftPositions = [
      {top: '12%', left: '0.5%', delay: '0s'},
      {top: '30%', left: '1%', delay: '2s'},
      {top: '48%', left: '0.8%', delay: '4s'},
      {top: '66%', left: '1.2%', delay: '6s'},
      {top: '84%', left: '0.7%', delay: '1s'},
    ];
    const rightPositions = [
      {top: '18%', right: '0.5%', delay: '3s'},
      {top: '36%', right: '1%', delay: '5s'},
      {top: '54%', right: '0.8%', delay: '1s'},
      {top: '72%', right: '1.2%', delay: '3s'},
      {top: '90%', right: '0.7%', delay: '7s'},
    ];
    rightPositions.forEach((pos, i) => {
      const heart = document.createElement('span');
      heart.className = `side-heart right-${i+1}`;
      heart.innerHTML = heartEmojis[(i+1) % heartEmojis.length];
      Object.assign(heart.style, pos);
      heart.style.animationDelay = pos.delay;
      side.appendChild(heart);
    });
    leftPositions.forEach((pos, i) => {
        const heart = document.createElement('span');
        heart.className = `side-heart left-${i+1}`;
        heart.innerHTML = heartEmojis[i % heartEmojis.length];
        Object.assign(heart.style, pos);
        heart.style.animationDelay = pos.delay;
        side.appendChild(heart);
    });
}


// O restante do seu código JS do relatório (função IIFE)
(function(){
  // elementos (continuação do seu código original)
  const bestEl = document.getElementById("bestMonth");
  const totalRevEl = document.getElementById("totalRevenue");
  const barCtx = document.getElementById("barChart") ? document.getElementById("barChart").getContext("2d") : null;
  const pieCtx = document.getElementById("pieChart") ? document.getElementById("pieChart").getContext("2d") : null;
  const tableBody = document.querySelector("#salesTable tbody");
  const transactionsCount = document.getElementById("transactionsCount");
  const buyerAvatar = document.getElementById("buyerAvatar");
  const buyerName = document.getElementById("buyerName");
  const buyerEmail = document.getElementById("buyerEmail");
  const buyerTotal = document.getElementById("buyerTotal");
  const buyerTableBody = document.querySelector("#buyerTable tbody");
  const exportBtn = document.getElementById("exportCsv");
  const searchInput = document.getElementById("searchInput");
  const resetBtn = document.getElementById("resetBtn");
  const yearFilter = document.getElementById("yearFilter");
  
  // Variáveis para gráficos
  let barChartInstance;
  let pieChartInstance;

  // Assume que 'sales' e 'parseDate' vêm de data.js e utils.js
  if (typeof sales === 'undefined' || typeof parseDate === 'undefined') {
    console.error("Arquivos de dados (data.js, utils.js) não carregados ou 'sales' não definido.");
    return;
  }

  // preparar anos no filtro
  const years = [...new Set(sales.map(s=>parseDate(s.date).getFullYear()))].sort((a,b)=>a-b);
  years.forEach(y=>{
    const o = document.createElement("option");
    o.value = y; o.textContent = y;
    yearFilter.appendChild(o);
  });
  yearFilter.value = years[years.length-1] || "";

  // ... (O restante da sua função 'build' e 'updateCharts' continua aqui)
  
  // Funções de inicialização e build (mantidas do seu código original)
  function formatCurrency(amount) {
    return `R$ ${amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }

  function getMonthName(monthIndex) {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleString('pt-BR', { month: 'long' });
  }

  function getCategory(productName) {
    const name = productName.toLowerCase();
    if (name.includes('rosa')) return 'Rosas';
    if (name.includes('orquidea')) return 'Orquídeas';
    if (name.includes('girassol')) return 'Girassóis';
    if (name.includes('tulipa')) return 'Tulipas';
    return 'Outras';
  }

  function build() {
    const year = yearFilter.value || null;
    let currentSales = year ? sales.filter(s => parseDate(s.date).getFullYear() === Number(year)) : sales;
    const searchTerm = searchInput.value.toLowerCase();

    // Aplica a pesquisa
    if (searchTerm) {
        currentSales = currentSales.filter(s => 
            s.buyer.toLowerCase().includes(searchTerm) || 
            s.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
    }


    // 1. Cálculos de Receita por Mês
    const revenueByMonth = {};
    let totalRevenue = 0;
    currentSales.forEach(s => {
        const date = parseDate(s.date);
        const monthYearKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!revenueByMonth[monthYearKey]) {
            revenueByMonth[monthYearKey] = { month: date.getMonth(), year: date.getFullYear(), revenue: 0 };
        }
        revenueByMonth[monthYearKey].revenue += s.total;
        totalRevenue += s.total;
    });

    const monthlyData = Object.values(revenueByMonth).sort((a, b) => a.year - b.year || a.month - b.month);
    
    // 2. Mês com maior receita
    let bestMonth = monthlyData.reduce((max, current) => current.revenue > max.revenue ? current : max, { revenue: 0 });
    bestEl.textContent = bestMonth.revenue > 0 ? `${getMonthName(bestMonth.month).toUpperCase()} de ${bestMonth.year} (${formatCurrency(bestMonth.revenue)})` : 'N/A';
    totalRevEl.textContent = formatCurrency(totalRevenue);
    transactionsCount.textContent = `${currentSales.length} vendas`;

    // 3. Top Comprador
    const buyerTotals = {};
    currentSales.forEach(s => {
        if (!buyerTotals[s.buyer]) {
            buyerTotals[s.buyer] = { total: 0, sales: [] };
        }
        buyerTotals[s.buyer].total += s.total;
        buyerTotals[s.buyer].sales.push(s);
    });

    let topBuyerName = Object.keys(buyerTotals).reduce((a, b) => buyerTotals[a].total > buyerTotals[b].total ? a : b, null);
    
    if (topBuyerName) {
        const topBuyerData = buyerTotals[topBuyerName];
        buyerName.textContent = topBuyerName;
        buyerEmail.textContent = currentSales.find(s => s.buyer === topBuyerName)?.email || 'Email Desconhecido';
        buyerTotal.textContent = formatCurrency(topBuyerData.total);
        buyerAvatar.textContent = topBuyerName.charAt(0).toUpperCase();

        // Tabela de Compras do Top Comprador
        buyerTableBody.innerHTML = '';
        topBuyerData.sales.sort((a,b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()).forEach(s => {
            const row = buyerTableBody.insertRow();
            row.insertCell().textContent = s.id;
            row.insertCell().textContent = s.date;
            row.insertCell().textContent = s.items.map(i => `${i.name} (${i.quantity})`).join(', ');
            row.insertCell().textContent = formatCurrency(s.total);
        });
    } else {
        buyerName.textContent = '—';
        buyerEmail.textContent = '—';
        buyerTotal.textContent = '—';
        buyerAvatar.textContent = 'A';
        buyerTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma venda encontrada.</td></tr>';
    }


    // 4. Tabela de Transações
    tableBody.innerHTML = '';
    currentSales.forEach(s => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = s.id;
        row.insertCell().textContent = s.date;
        row.insertCell().textContent = s.buyer;
        row.insertCell().textContent = s.items.map(i => `${i.name} (${i.quantity})`).join(', ');
        row.insertCell().textContent = formatCurrency(s.total);
    });

    // 5. Atualiza Gráficos
    updateCharts(monthlyData, currentSales);
  }

  function updateCharts(monthlyData, currentSales) {
    if(!barCtx || !pieCtx) return;

    // Dados para o Gráfico de Barras (Receita Mensal)
    const barLabels = monthlyData.map(d => `${getMonthName(d.month)}/${d.year.toString().slice(-2)}`);
    const barValues = monthlyData.map(d => d.revenue);

    // Dados para o Gráfico de Pizza (Categorias)
    const categoryData = {};
    currentSales.forEach(s => {
        s.items.forEach(item => {
            const category = getCategory(item.name);
            if (!categoryData[category]) categoryData[category] = 0;
            categoryData[category] += item.quantity * item.price; 
        });
    });
    const pieLabels = Object.keys(categoryData);
    const pieValues = Object.values(categoryData);
    
    // Cores (Lindos Detalles Palette)
    const barColor = '#ff6b9d';
    const pieColors = ['#ff6b9d', '#ff98c6', '#ffb6d5', '#ffdae9', '#ffeef6']; 

    // Destrói instâncias anteriores
    if (barChartInstance) barChartInstance.destroy();
    if (pieChartInstance) pieChartInstance.destroy();

    // Gráfico de Barras
    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: barLabels,
            datasets: [{
                label: 'Receita (R$)',
                data: barValues,
                backgroundColor: barColor,
                borderColor: barColor,
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Gráfico de Pizza
    pieChartInstance = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: pieLabels,
            datasets: [{
                label: 'Receita por Categoria',
                data: pieValues,
                backgroundColor: pieColors.slice(0, pieLabels.length),
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
  }


  // Event Listeners (mantidos do seu código original)
  yearFilter.addEventListener("change", build);
  searchInput.addEventListener("input", build);
  resetBtn.addEventListener("click", ()=>{ 
    searchInput.value=""; 
    // Garante que o filtro de ano volte para o último ano (o mais recente)
    yearFilter.value = years[years.length-1] || ""; 
    build(); 
  });
  
  // Exportar CSV
  exportBtn.addEventListener("click", ()=> {
    // Você precisa ter a função exportTableToCSV definida em utils.js
    if (typeof exportTableToCSV === 'undefined') {
        alert("Erro: A função exportTableToCSV não foi encontrada no utils.js");
        return;
    }

    const rows = [["Id", "Data", "Comprador", "Itens", "Total"]];
    const trs = document.querySelectorAll("#salesTable tbody tr");
    trs.forEach(tr => {
      const cells = Array.from(tr.querySelectorAll("td")).map(td => td.textContent);
      rows.push(cells);
    });
    exportTableToCSV("transacoes.csv", rows);
  });

  // Função de Ordenação de Tabela (mantida do seu código original)
  document.querySelectorAll("#salesTable th").forEach((th, idx) => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const rows = Array.from(document.querySelectorAll("#salesTable tbody tr"));
      const asc = th.dataset.asc === "1" ? false : true;
      rows.sort((a, b) => {
        const ta = a.children[idx].textContent.trim();
        const tb = b.children[idx].textContent.trim();
        if(idx===0 || idx===4) { // id ou total
          const na = Number(ta.replace(/[^d,.-]/g,"").replace(",",".") || 0);
          const nb = Number(tb.replace(/[^d,.-]/g,"").replace(",",".") || 0);
          return asc ? na-nb : nb-na;
        }
        return asc ? ta.localeCompare(tb): tb.localeCompare(ta);
      });
      th.dataset.asc = asc ? "1" : "0";
      tableBody.innerHTML = '';
      rows.forEach(row => tableBody.appendChild(row));
    });
  });

  // Inicializa quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function() {
    createHearts(); // Inicia os corações
    build(); // Inicia a construção do relatório
  });

})();