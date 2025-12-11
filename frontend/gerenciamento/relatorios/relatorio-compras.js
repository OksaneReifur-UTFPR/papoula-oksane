// relatorio-compras.js

// Configuração da API
const API_BASE_URL = 'http://localhost:3000'; // Ajuste conforme seu backend
// Rota para buscar todas as transações (vendas)
const API_ENDPOINT = `${API_BASE_URL}/sales`; 

let currentSalesData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização visual
    createHearts();
    
    // Carrega e processa os dados da API
    loadAndProcessData();
});

/**
 * Carrega os dados de vendas da API, processa e renderiza os gráficos/tabela.
 */
async function loadAndProcessData() {
    const tableBody = document.querySelector('#tableCompras tbody');
    const chartStatus = document.getElementById('chartStatus');
    
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}.`);
        }
        
        // Assume que a API retorna um array de vendas (salesData)
        const salesData = await response.json(); 

        if (!Array.isArray(salesData) || salesData.length === 0) {
            console.warn("Nenhuma compra registrada ou dados vazios da API.");
            mostrarMensagem("Nenhuma compra registrada para análise.", 'warning');
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; font-style: italic;">Nenhuma compra registrada para análise.</td></tr>';
            if (chartStatus) chartStatus.textContent = "Nenhum dado para o gráfico.";
            return;
        }
        
        currentSalesData = salesData;

        // 1. Processa dados para Gráfico (Agregação por Cliente)
        const aggregatedByClient = aggregateByClient(salesData);
        renderChartGastoCliente(aggregatedByClient);

        // 2. Processa dados para Tabela (Lista detalhada de itens)
        const flattenedItems = flattenSalesData(salesData);
        renderTable(flattenedItems);
        
        // 3. Liga a ordenação da tabela
        bindTableSorting(flattenedItems);
        
    } catch (error) {
        console.error("Falha ao carregar dados do relatório:", error);
        mostrarMensagem(`Erro ao carregar dados. Verifique o servidor e o endpoint: ${error.message}`, 'error', 8000);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #880e4f;">
        💔 Erro ao carregar dados da API.
        </td></tr>`;
        if (chartStatus) chartStatus.textContent = "Erro ao carregar dados.";
    }
}

// =================================================================
// PROCESSAMENTO DE DADOS (AGREGAÇÃO/ACHATAMENTO)
// =================================================================

/**
 * Agrega o total gasto por cada cliente.
 * @param {Array} sales - Lista de objetos de vendas/pedidos.
 * @returns {Array} Array de objetos { cliente: 'Nome', total: 123.45 }
 */
function aggregateByClient(sales) {
    const map = {};
    sales.forEach(s => {
        // Assume que s.buyer.name e s.total existem
        const clientName = s.buyer && s.buyer.name ? s.buyer.name : `ID: ${s.buyer.id || 'Desconhecido'}`;
        
        map[clientName] = map[clientName] || { cliente: clientName, total: 0 };
        map[clientName].total += s.total;
    });
    
    // Converte para array e ordena por total gasto (decrescente)
    return Object.values(map).sort((a, b) => b.total - a.total);
}

/**
 * "Achata" (flatten) a estrutura de vendas em uma lista de itens detalhados.
 * Cria uma linha na tabela para cada item vendido.
 * @param {Array} sales - Lista de objetos de vendas/pedidos.
 * @returns {Array} Array de objetos detalhados por item.
 */
function flattenSalesData(sales) {
    const detailedItems = [];
    sales.forEach(s => {
        const clientName = s.buyer && s.buyer.name ? s.buyer.name : `ID: ${s.buyer.id || 'Desconhecido'}`;
        
        s.items.forEach(item => {
            detailedItems.push({
                cliente: clientName,
                produto: item.flower, // Ou o campo que você usa para nome do produto
                quantidade: item.qty,
                valor_unitario: item.price,
                subtotal: item.qty * item.price,
            });
        });
    });
    return detailedItems;
}


// =================================================================
// RENDERIZAÇÃO E EVENTOS
// =================================================================

let chartGastoCliente = null; 
function renderChartGastoCliente(data) {
    const chartCanvas = document.getElementById('chartGastoCliente');
    const chartStatus = document.getElementById('chartStatus');
    
    if (!chartCanvas) return;
    if (chartStatus) chartStatus.style.display = 'none';

    if (chartGastoCliente) chartGastoCliente.destroy(); 

    const topData = data.slice(0, 10);
    
    const clientLabels = topData.map(d => d.cliente);
    const clientTotals = topData.map(d => d.total);

    chartGastoCliente = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: clientLabels,
            datasets: [{
                label: 'Total Gasto (R$)',
                data: clientTotals,
                backgroundColor: 'rgba(255, 107, 157, 0.7)', 
                borderColor: 'rgba(255, 107, 157, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y', // Gráfico de barras horizontal
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed.x;
                            return `Total: ${typeof formatCurrency === 'function' ? formatCurrency(value) : 'R$ ' + value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Valor Gasto (R$)' },
                    ticks: {
                        callback: (value) => typeof formatCurrency === 'function' ? formatCurrency(value) : 'R$ ' + value
                    }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderTable(data) {
    const tableBody = document.querySelector('#tableCompras tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = ''; 

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; font-style: italic;">Nenhum item vendido encontrado.</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        
        const unitPriceFormatted = typeof formatCurrency === 'function' ? formatCurrency(item.valor_unitario) : 'R$ ' + item.valor_unitario.toFixed(2);
        const subtotalFormatted = typeof formatCurrency === 'function' ? formatCurrency(item.subtotal) : 'R$ ' + item.subtotal.toFixed(2);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.cliente}</td>
            <td>${item.produto}</td>
            <td data-raw="${item.quantidade}">${item.quantidade}</td>
            <td data-raw="${item.valor_unitario}">${unitPriceFormatted}</td>
            <td data-raw="${item.subtotal}">${subtotalFormatted}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Liga os eventos de ordenação aos cabeçalhos da tabela.
 * @param {Array} data - Os dados brutos da lista de itens para ordenação.
 */
function bindTableSorting(data) {
    document.querySelectorAll("#tableCompras th[data-sort]").forEach((th, idx) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const sortBy = th.getAttribute('data-sort');
            const isAscending = th.dataset.asc === "1" ? false : true;

            data.sort((a, b) => {
                let valA, valB;

                if (sortBy === 'cliente' || sortBy === 'produto') {
                    // Ordenação por string
                    valA = a[sortBy];
                    valB = b[sortBy];
                    return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
                } else { // 'quantidade', 'valor_unitario', 'subtotal' (numéricos)
                    valA = a[sortBy];
                    valB = b[sortBy];
                    return isAscending ? valA - valB : valB - valA;
                }
            });
            
            // Atualiza o estado de ordenação e a tabela
            th.dataset.asc = isAscending ? "1" : "0";
            renderTable(data);
        });
    });
}


// =================================================================
// FUNÇÕES AUXILIARES (Mensagens e Corações) - Manter no JS
// =================================================================

function createHearts() {
    const containers = document.querySelectorAll('.floating-hearts, .side-hearts');
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨']; 
    
    containers.forEach(container => {
        container.innerHTML = ''; 
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            heart.classList.add(container.classList.contains('side-hearts') ? 'side-heart' : 'heart');
            heart.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            
            // Posições aleatórias na viewport (ajuste se necessário, dependendo do seu CSS)
            heart.style.left = `${Math.random() * 100}vw`;
            heart.style.top = `${5 + Math.random() * 90}vh`;
            
            heart.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
            heart.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(heart);
        }
    });
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