// flores-mais-vendidas.js
// Requer: data.js (sales) e utils.js (aggregateFlowers)

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


// ===================================================
// LÓGICA DO RELATÓRIO DE FLORES
// ===================================================
(function(){

    // Checa se as dependências foram carregadas
    if (typeof sales === 'undefined' || typeof aggregateFlowers === 'undefined' || typeof formatCurrency === 'undefined') {
        console.error("Arquivos de dados (data.js, utils.js) não carregados ou funções não definidas.");
        // Usa dados de fallback para evitar erro total, mas informa ao usuário (se existisse uma UI para isso)
        // Por hora, apenas retorna.
        return;
    }

    const tableBody = document.querySelector('#tableFlores tbody');
    const barCtx = document.getElementById('chartFlores');
    const pieCtx = document.getElementById('chartPizzaFlores');
    const exportBtn = document.getElementById('exportCsv');
    const searchInput = document.getElementById('searchInput');
    const metricFilter = document.getElementById('metricFilter');
    const resetBtn = document.getElementById('resetBtn');

    let barChartInstance;
    let pieChartInstance;
    let currentData = [];

    // Cores (Lindos Detalles Palette)
    const barColor = '#ff6b9d';
    const pieColors = ['#ff6b9d', '#ff98c6', '#ffb6d5', '#ffdae9', '#ffeef6', '#fdd8e9', '#f9c5d8']; 

    /**
     * Filtra e ordena os dados e atualiza a UI.
     */
    function buildReport() {
        // 1. Agrega os dados de vendas para obter a lista de flores
        let floresVendidas = aggregateFlowers(sales); 

        // 2. Aplica filtro de busca
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            floresVendidas = floresVendidas.filter(f => 
                f.flower.toLowerCase().includes(searchTerm)
            );
        }

        // 3. Aplica ordenação
        const sortMetric = metricFilter.value;
        if (sortMetric === 'revenue') {
             floresVendidas.sort((a, b) => b.revenue - a.revenue);
        } else { // 'qty' é o padrão
             floresVendidas.sort((a, b) => b.qty - a.qty);
        }

        currentData = floresVendidas;

        // 4. Atualiza Tabela e Gráficos
        carregarTabela(currentData);
        gerarGraficoBarras(currentData);
        gerarGraficoPizza(currentData);
    }

    /**
     * Popula a tabela com os dados.
     */
    function carregarTabela(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma flor encontrada com o filtro atual.</td></tr>';
            return;
        }

        data.forEach((flor, index) => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = index + 1;
            row.insertCell().textContent = flor.flower;
            row.insertCell().textContent = flor.qty;
            row.insertCell().textContent = formatCurrency(flor.revenue);
        });
    }

    /**
     * Gera o gráfico de barras.
     */
    function gerarGraficoBarras(data) {
        if (!barCtx) return;
        
        // Limita ao Top 10 para melhor visualização
        const topData = data.slice(0, 10);

        if (barChartInstance) barChartInstance.destroy();
        
        barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: topData.map(f => f.flower),
                datasets: [{
                    label: 'Quantidade vendida',
                    data: topData.map(f => f.qty),
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
                    title: {
                        display: true,
                        text: 'Top 10 Flores (Quantidade)'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Gera o gráfico de pizza.
     */
    function gerarGraficoPizza(data) {
        if (!pieCtx) return;

        if (pieChartInstance) pieChartInstance.destroy();

        pieChartInstance = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: data.map(f => f.flower),
                datasets: [{
                    data: data.map(f => f.qty),
                    backgroundColor: pieColors.slice(0, data.length),
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    // ===================================================
    // EVENT LISTENERS
    // ===================================================

    // Disparadores de reconstrução do relatório
    searchInput.addEventListener("input", buildReport);
    metricFilter.addEventListener("change", buildReport);

    // Botão de reset
    resetBtn.addEventListener("click", ()=>{ 
        searchInput.value = ""; 
        metricFilter.value = "qty";
        buildReport(); 
    });

    // Exportar CSV
    exportBtn.addEventListener("click", ()=> {
        if (typeof exportTableToCSV === 'undefined') {
            alert("Erro: A função exportTableToCSV não foi encontrada no utils.js");
            return;
        }

        const rows = [["#", "Nome da Flor", "Quantidade Vendida", "Receita Gerada"]];
        currentData.forEach((flor, index) => {
            rows.push([
                index + 1, 
                flor.flower, 
                flor.qty.toString(), 
                formatCurrency(flor.revenue)
            ]);
        });
        exportTableToCSV("flores-mais-vendidas.csv", rows);
    });

    // Função de Ordenação de Tabela (adaptada)
    document.querySelectorAll("#tableFlores th[data-sort]").forEach((th, idx) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const sortBy = th.getAttribute('data-sort');
            const isAscending = th.dataset.asc === "1" ? false : true;

            currentData.sort((a, b) => {
                if (sortBy === 'flower') {
                    return isAscending ? a.flower.localeCompare(b.flower) : b.flower.localeCompare(a.flower);
                } else { // 'qty' ou 'revenue'
                    return isAscending ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
                }
            });
            
            // Atualiza o estado de ordenação e a tabela
            th.dataset.asc = isAscending ? "1" : "0";
            carregarTabela(currentData);
        });
    });


    // Inicializa quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        createHearts(); 
        buildReport(); 
    });

})();