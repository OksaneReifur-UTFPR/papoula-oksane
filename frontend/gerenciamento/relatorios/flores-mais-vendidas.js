// flores-mais-vendidas.js

// Configuração da API
const API_BASE_URL = 'http://localhost:3000'; // Ajuste conforme seu backend
// Rota sugerida: /relatorio/flores-mais-vendidas ou /sales/flowers
const API_ENDPOINT = `${API_BASE_URL}/relatorio/flores-mais-vendidas`; 

// Variável global para armazenar os dados carregados e filtrados
let currentData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização visual e eventos
    createHearts();
    bindEvents();
    
    // Carrega e processa os dados da API
    loadAndProcessData();
});

/**
 * Carrega os dados de vendas da API, processa e renderiza os gráficos/tabela.
 */
async function loadAndProcessData() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}. Certifique-se de que o servidor está rodando e o endpoint '${API_ENDPOINT}' existe.`);
        }
        
        // Assume que a API retorna um array de vendas (salesData)
        // A estrutura deve ser a mesma do seu data.js: 
        // [{ id: pedidoId, ..., items: [{flower: nomeProduto, qty: quantidade, price: precoUnitario}] }, ...]
        const salesData = await response.json(); 

        if (!Array.isArray(salesData) || salesData.length === 0) {
            console.warn("Nenhuma compra registrada ou dados vazios da API.");
            mostrarMensagem("Nenhuma compra registrada para análise. O relatório está vazio.", 'warning');
            renderEmptyState();
            return;
        }
        
        // A função aggregateFlowers (de utils.js) é crucial
        if (typeof aggregateFlowers !== 'function') {
             throw new Error("Função 'aggregateFlowers' não está definida. Verifique se 'utils.js' foi carregado corretamente.");
        }

        // 1. Processa dados (Agregação: nome da flor, qty total, receita total)
        currentData = aggregateFlowers(salesData);

        // 2. Renderiza os componentes
        const initialMetric = document.getElementById('metricFilter').value;
        currentData.sort((a, b) => b[initialMetric] - a[initialMetric]); // Ordena por métrica inicial
        
        renderChartBarras(currentData);
        renderChartPizza(currentData);
        carregarTabela(currentData);
        
    } catch (error) {
        console.error("Falha ao carregar dados do relatório:", error);
        mostrarMensagem(`Erro ao carregar dados do relatório. Verifique o servidor e o endpoint: ${error.message}`, 'error', 8000);
        renderEmptyState();
    }
}


// =================================================================
// FUNÇÕES DE UI E EVENTOS
// =================================================================

function bindEvents() {
    const searchInput = document.getElementById('searchInput');
    const metricFilter = document.getElementById('metricFilter');
    const resetBtn = document.getElementById('resetBtn');
    
    // Filtro por busca
    searchInput.addEventListener('input', debounce(filterAndRender, 300));
    
    // Filtro por métrica (ordenar)
    metricFilter.addEventListener('change', filterAndRender);

    // Botão de reset (limpa busca e volta a ordenar por qty)
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        metricFilter.value = 'qty';
        filterAndRender();
    });

    // Função de Ordenação de Tabela (ligada ao event listener no final)
    document.querySelectorAll("#tableFlores th[data-sort]").forEach((th) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const sortBy = th.getAttribute('data-sort');
            const isAscending = th.dataset.asc === "1" ? false : true;

            // Filtra os dados se houver busca, senão usa o array completo
            const dataToSort = searchInput.value ? currentData.filter(item => item.flower.toLowerCase().includes(searchInput.value.toLowerCase())) : currentData;

            dataToSort.sort((a, b) => {
                if (sortBy === 'flower') {
                    return isAscending ? a.flower.localeCompare(b.flower) : b.flower.localeCompare(a.flower);
                } else { // 'qty' ou 'revenue'
                    return isAscending ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
                }
            });
            
            // Atualiza o estado de ordenação e a tabela
            th.dataset.asc = isAscending ? "1" : "0";
            carregarTabela(dataToSort);
        });
    });
}

function filterAndRender() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const metricFilter = document.getElementById('metricFilter').value;

    let filteredData = currentData;

    // Aplica filtro de busca
    if (searchInput) {
        filteredData = currentData.filter(item => 
            item.flower.toLowerCase().includes(searchInput)
        );
    }
    
    // Aplica ordenação
    filteredData.sort((a, b) => b[metricFilter] - a[metricFilter]);

    // Renderiza a tabela
    carregarTabela(filteredData); 
    // OBS: Gráficos não são atualizados no filtro de busca para manter a visão geral.
}


// --- Funções de Renderização de Gráfico (Chart.js) ---

let chartBarras = null; 
function renderChartBarras(data) {
    const chartCanvas = document.getElementById('chartFlores');
    if (!chartCanvas) return;
    
    if (chartBarras) chartBarras.destroy(); 

    const topData = data.slice(0, 10);
    
    const flowerLabels = topData.map(d => d.flower);
    const flowerQuantities = topData.map(d => d.qty);

    chartBarras = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: flowerLabels,
            datasets: [{
                label: 'Quantidade Vendida',
                data: flowerQuantities,
                backgroundColor: 'rgba(255, 107, 157, 0.7)', 
                borderColor: 'rgba(255, 107, 157, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { display: false },
                title: { display: false },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Qtd Vendida' }
                }
            }
        }
    });
}

let chartPizza = null; 
function renderChartPizza(data) {
    const chartCanvas = document.getElementById('chartPizzaFlores');
    if (!chartCanvas) return;
    
    if (chartPizza) chartPizza.destroy(); 
    
    const topData = data.slice(0, 5); 
    
    const flowerLabels = topData.map(d => d.flower);
    const flowerQuantities = topData.map(d => d.qty);
    const backgroundColors = [
        '#FF6B9D', 
        '#FFB4C6', 
        '#FFDBE5', 
        '#FFECEF', 
        '#D8A4B6',
    ];

    chartPizza = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: flowerLabels,
            datasets: [{
                label: 'Quantidade Vendida',
                data: flowerQuantities,
                backgroundColor: backgroundColors.slice(0, topData.length),
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        font: { family: 'Poppins' }
                    }
                },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return `${context.label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    });
}

function carregarTabela(data) {
    const tableBody = document.querySelector('#tableFlores tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = ''; 

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; font-style: italic;">Nenhuma flor encontrada com o filtro atual.</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.flower}</td>
            <td>${item.qty}</td>
            <td>${typeof formatCurrency === 'function' ? formatCurrency(item.revenue) : 'R$ ' + item.revenue.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderEmptyState() {
    const dashboard = document.querySelector('.dashboard');
    if (dashboard) {
        dashboard.innerHTML = '<p style="text-align:center; padding: 50px; font-size: 1.2rem; color: #880e4f;">💔 Não foi possível carregar os dados do relatório. Verifique a conexão com o servidor da API.</p>';
    }
}


// =================================================================
// FUNÇÕES AUXILIARES (debounce, mostrarMensagem, createHearts)
// =================================================================

function debounce(fn, wait) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

function mostrarMensagem(texto, tipo = 'info', duration = 4000) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        padding: 10px 20px; border-radius: 8px; font-family: 'Poppins', sans-serif;
        font-weight: 600; z-index: 1000; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        opacity: 0; transition: opacity 0.3s;
    `;
    
    switch(tipo) {
        case 'success': container.style.background = '#e8f5e9'; container.style.color = '#2e7d32'; break;
        case 'error': container.style.background = '#fce4ec'; container.style.color = '#880e4f'; break;
        default: container.style.background = '#fff8e1'; container.style.color = '#8d6e63';
    }

    container.textContent = texto;
    document.body.appendChild(container);

    setTimeout(() => { container.style.opacity = '1'; }, 10);
    setTimeout(() => {
        container.style.opacity = '0';
        setTimeout(() => { container.remove(); }, 300);
    }, duration);
}

function createHearts() {
    const containers = document.querySelectorAll('.floating-hearts, .side-hearts');
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨']; 
    
    containers.forEach(container => {
        container.innerHTML = ''; 
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.classList.add(container.classList.contains('side-hearts') ? 'side-heart' : 'heart');
            heart.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.top = `${5 + Math.random() * 90}vh`;
            heart.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
            heart.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(heart);
        }
    });
}