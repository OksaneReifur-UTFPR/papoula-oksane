

/* ATUALIZAÇÃO VISUAL PARA REPLICAR O ESTILO DO EXEMPLO:
   Gera corações/emojis dinâmicos com a animação e estilo do gerenciamento.css.
   A lógica de CRUD abaixo permanece INTACTA.
*/

(function () {
    // Debounce simples (mantido)
    function debounce(fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Pool de emojis fofo para o fundo
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨', '💖', '💕', '🌸', '💓', '💞'];

    // Cria um span. Classe 'emoji' segue o pedido.css atualizado.
    function createEmoji() {
        const el = document.createElement('span');
        el.className = 'emoji';
        el.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

        // Posição aleatória na viewport (mantido)
        const left = Math.random() * 100; // vw
        const top = Math.random() * 100;  // vh
        el.style.left = `${left}vw`;
        el.style.top = `${top}vh`;

        // Tamanho aleatório (mantido)
        el.style.fontSize = `${(Math.random() * 1.4 + 0.8).toFixed(2)}rem`;

        // Duração e delay aleatórios, usando a animação 'pulsingFloat' do CSS
        const duration = (Math.random() * 5) + 5; // 5s a 10s
        const delay = Math.random() * 5;
        el.style.animation = `pulsingFloat ${duration}s ease-in-out ${delay}s infinite`;

        return el;
    }

    // Popula a camada emoji-container com uma quantidade proporcional à largura
    function populateEmojis() {
        let container = document.querySelector('.emoji-container');

        // Cria o container principal
        if (!container) {
            container = document.createElement('div');
            container.className = 'emoji-container';
            document.body.appendChild(container);
        }

        container.innerHTML = ''; // limpa antes de popular

        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        // quantidade adaptativa; em telas grandes fica mais cheio, em mobile reduz (mantido)
        const total = Math.min(48, Math.max(14, Math.floor(vw / 30)));

        for (let i = 0; i < total; i++) {
            const emoji = createEmoji();
            container.appendChild(emoji);
        }
    }

    // Inicializa no DOMContentLoaded e reaplica no resize com debounce
    function initEmojis() {
        populateEmojis();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmojis);
    } else {
        initEmojis();
    }
    window.addEventListener('resize', debounce(initEmojis, 350));
})();



// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPedidoId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pedidoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const messageContainer = document.getElementById('messageContainer');

// Event Listeners
btnBuscar.addEventListener('click', buscarPedido);
btnIncluir.addEventListener('click', incluirPedido);
btnAlterar.addEventListener('click', alterarPedido);
btnExcluir.addEventListener('click', excluirPedido);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// Inicial: Buscar + Cancelar
mostrarBotoes(true, false, false, false, false, true);
bloquearCampos(false);

function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            input.disabled = bloquearPrimeiro; // campo de busca
        } else {
            input.disabled = !bloquearPrimeiro;
        }
    });
}

function limparFormulario() {
    form.reset();
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

function formatarDataParaInputDate(data) {
    const dataObj = new Date(data);
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dataObj.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function preencherFormulario(pedido) {
    currentPedidoId = pedido.id_pedido;
    searchId.value = pedido.id_pedido;
    if (pedido.data_pedido) {
        document.getElementById('data_pedido').value = formatarDataParaInputDate(pedido.data_pedido);
    } else {
        document.getElementById('data_pedido').value = '';
    }
    document.getElementById('cpf_cliente').value = pedido.cpf_cliente || '';
}

async function buscarPedido() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    searchId.focus();

    try {
        const response = await fetch(`${API_BASE_URL}/pedido/${id}`);
        if (response.ok) {
            const pedido = await response.json();
            preencherFormulario(pedido);
            // Encontrado: Buscar + Alterar + Excluir + Cancelar
            mostrarBotoes(true, false, true, true, false, true);
            mostrarMensagem('Pedido encontrado!', 'success');
            await carregarItensDoPedido(pedido.id_pedido);
        } else if (response.status === 404) {
            // Não encontrado: Buscar + Incluir + Cancelar
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, true);
            mostrarMensagem('Pedido não encontrado. Você pode incluir um novo pedido.', 'info');
            bloquearCampos(false);
            document.getElementById('itensTableBody').innerHTML = '';
        } else {
            throw new Error('Erro ao buscar pedido');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pedido', 'error');
    }
}

async function carregarItensDoPedido(pedidoId) {
    try {
        const responseItens = await fetch(`${API_BASE_URL}/pedido_has_planta`);
        if (responseItens.ok) {
            const itensDoPedido = await responseItens.json();
            const itensFiltrados = itensDoPedido.filter(item => item.id_pedido == pedidoId);
            renderizarTabelaItensPedido(itensFiltrados || []);
        } else {
            document.getElementById('itensTableBody').innerHTML = '';
        }
    } catch (error) {
        document.getElementById('itensTableBody').innerHTML = '';
    }
}

function renderizarTabelaItensPedido(itens) {
    const itensTableBody = document.getElementById('itensTableBody');
    itensTableBody.innerHTML = '';
    if (!Array.isArray(itens)) itens = [itens];

    itens.forEach((item, index) => {
        let subTotal = item.quantidade * item.preco_planta;
        subTotal = subTotal.toFixed(2).replace('.', ',');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id_pedido}</td>
            <td>${item.id_planta}</td>
            <td>${item.nome_popular || ''}</td>
            <td>
                <input type="number" class="quantidade-input" data-index="${index}" value="${item.quantidade}" min="1">
            </td>
            <td>
                <input type="number" class="preco-input" data-index="${index}" value="${item.preco_planta}" min="0" step="0.01">
            </td>
            <td class="subtotal-cell">${subTotal}</td>
            <td>
                <button class="btn-secondary btn-small" onclick="btnAtualizarItem(this)">Atualizar</button>
            </td>
            <td>
                <button class="btn-secondary btn-small" onclick="btnExcluirItem(this)">Excluir</button>
            </td>
        `;
        itensTableBody.appendChild(row);
    });
    adicionarEventListenersSubtotal();
}

function adicionarEventListenersSubtotal() {
    document.querySelectorAll('.quantidade-input, .preco-input').forEach(input => {
        input.addEventListener('input', atualizarSubtotal);
        input.addEventListener('change', atualizarSubtotal);
    });
}

function atualizarSubtotal(event) {
    const row = event.target.closest('tr');
    const quantidade = parseFloat(row.querySelector('.quantidade-input').value) || 0;
    const preco = parseFloat(row.querySelector('.preco-input').value) || 0;
    row.querySelector('.subtotal-cell').textContent = (quantidade * preco).toFixed(2).replace('.', ',');
}

async function incluirPedido() {
    mostrarMensagem('Digite os dados!', 'success');
    currentPedidoId = searchId.value;
    limparFormulario();
    searchId.value = currentPedidoId;
    bloquearCampos(true);
    // Durante inclusão: Salvar + Cancelar
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('data_pedido').focus();
    operacao = 'incluir';
}

async function alterarPedido() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    // Durante alteração: Salvar + Cancelar
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('data_pedido').focus();
    operacao = 'alterar';
}

async function excluirPedido() {
    if (!searchId.value) {
        mostrarMensagem('Digite o ID antes de excluir.', 'warning');
        return;
    }
    if (!confirm(`Tem certeza que deseja excluir o pedido ${searchId.value}?`)) return;

    mostrarMensagem('Excluindo pedido...', 'info');
    currentPedidoId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    // Durante exclusão: Salvar (para confirmar) + Cancelar
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

async function salvarOperacao() {
    const formData = new FormData(form);
    const pedido = {
        cpf_cliente: formData.get('cpf_cliente'),
        data_pedido: formData.get('data_pedido')
    };
    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pedido`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/pedido/${currentPedidoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/pedido/${currentPedidoId}`, { method: 'DELETE' });
        }

        if (response && response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            document.getElementById('itensTableBody').innerHTML = '';
        } else if (response && operacao === 'excluir' && response.ok) {
            mostrarMensagem('Pedido excluído com sucesso!', 'success');
            limparFormulario();
            document.getElementById('itensTableBody').innerHTML = '';
        } else {
            // tenta extrair mensagem de erro do corpo
            let errorMsg = 'Erro ao incluir/alterar/excluir pedido';
            if (response) {
                try {
                    const error = await response.json();
                    if (error && error.error) errorMsg = error.error;
                } catch (e) {
                    // corpo não é JSON
                }
            }
            mostrarMensagem(errorMsg, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao incluir/alterar/excluir pedido', 'error');
    } finally {
        // retorna para estado inicial (Buscar + Cancelar)
        mostrarBotoes(true, false, false, false, false, true);
        bloquearCampos(false);
        searchId.disabled = false;
        searchId.focus();
        operacao = null;
    }
}

function cancelarOperacao() {
    limparFormulario();
    // voltar ao estado inicial: Buscar + Cancelar
    mostrarBotoes(true, false, false, false, false, true);
    bloquearCampos(false);
    searchId.disabled = false;
    searchId.focus();
    operacao = null;
    mostrarMensagem('Operação cancelada', 'info');
}

// ====== ITENS DO PEDIDO (PLANTA) ======
function adicionarItem() {
    const itensTableBody = document.getElementById('itensTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="number" class="pedido-id-input" value="${searchId.value}" disabled>
        </td>
        <td class="produto-group">
            <input type="number" class="planta-id-input">
            <button class="btn-secondary btn-small" onclick="buscarPlantaPorId(this)">Buscar</button>
        </td>
        <td>
            <span class="planta-nome-input">---</span>
        </td>
        <td>
            <input type="number" class="quantidade-input" value="1" min="1">
        </td>
        <td>
            <input type="number" class="preco-input" value="0.00" min="0" step="0.01">
        </td>
        <td class="subtotal-cell">0,00</td>
        <td>
            <button class="btn-secondary btn-small" onclick="btnAdicionarItem(this)">Adicionar</button>
        </td>
        <td>
            <button class="btn-secondary btn-small" onclick="btnCancelarItem(this)">Cancelar</button>
        </td>
    `;
    itensTableBody.appendChild(row);
    adicionarEventListenersSubtotal();
}

async function buscarPlantaPorId(button) {
    const row = button.closest('tr');
    const plantaIdInput = row.querySelector('.planta-id-input');
    const plantaId = plantaIdInput.value;
    if (!plantaId) {
        mostrarMensagem('Por favor, insira um ID de planta.', 'warning');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/planta/${plantaId}`);
        if (!response.ok) throw new Error('Planta não encontrada.');
        const planta = await response.json();
        row.querySelector('.preco-input').value = planta.preco_planta;
        row.querySelector('.planta-nome-input').textContent = planta.nome_popular;
        atualizarSubtotal({ target: row.querySelector('.preco-input') });
        mostrarMensagem(`Planta ${planta.nome_popular} encontrada!`, 'success');
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao buscar planta', 'error');
    }
}

function btnAdicionarItem(button) {
    const row = button.closest('tr');
    const pedidoId = row.querySelector('.pedido-id-input').value;
    const plantaId = row.querySelector('.planta-id-input').value;
    const quantidade = row.querySelector('.quantidade-input').value;
    const precoPlanta = row.querySelector('.preco-input').value;
    const itemData = {
        id_pedido: parseInt(pedidoId),
        id_planta: parseInt(plantaId),
        quantidade: parseInt(quantidade),
        preco_planta: parseFloat(String(precoPlanta).replace(',', '.'))
    };
    if (
        isNaN(itemData.id_pedido) ||
        isNaN(itemData.id_planta) ||
        isNaN(itemData.quantidade) ||
        isNaN(itemData.preco_planta)
    ) {
        mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'warning');
        return;
    }
    fetch(`${API_BASE_URL}/pedido_has_planta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao adicionar o item do pedido. Verifique os IDs!');
            return response.json();
        })
        .then(() => {
            mostrarMensagem('Item adicionado com sucesso!', 'success');
            // recarrega o pedido atual para mostrar itens atualizados
            buscarPedido();
        })
        .catch(error => {
            mostrarMensagem(error.message || 'Erro ao adicionar item', 'error');
        });
}

function btnCancelarItem(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        mostrarMensagem('Adição do item cancelada.', 'info');
    }
}

function btnAtualizarItem(button) {
    const row = button.closest('tr');
    const cells = Array.from(row.cells);
    const pedidoId = cells[0].textContent;
    const plantaId = cells[1].textContent;
    const quantidade = cells[3].querySelector('input').value;
    const precoPlanta = cells[4].querySelector('input').value;
    const itemData = {
        id_pedido: parseInt(pedidoId),
        id_planta: parseInt(plantaId),
        quantidade: parseInt(quantidade),
        preco_planta: parseFloat(String(precoPlanta).replace(',', '.'))
    };
    if (
        isNaN(itemData.id_pedido) ||
        isNaN(itemData.id_planta) ||
        isNaN(itemData.quantidade) ||
        isNaN(itemData.preco_planta)
    ) {
        mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'warning');
        return;
    }
    fetch(`${API_BASE_URL}/pedido_has_planta/${itemData.id_pedido}/${itemData.id_planta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
    })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao salvar o item do pedido.');
            return response.json();
        })
        .then(() => {
            mostrarMensagem('Item salvo com sucesso!', 'success');
        })
        .catch(error => {
            mostrarMensagem(error.message || 'Erro ao salvar item', 'error');
        });
}

function btnExcluirItem(button) {
    const row = button.closest('tr');
    const pedidoId = row.cells[0].textContent;
    const plantaId = row.cells[1].textContent;
    if (isNaN(parseInt(pedidoId)) || isNaN(parseInt(plantaId))) {
        mostrarMensagem('IDs do pedido ou planta inválidos.', 'warning');
        return;
    }
    if (!confirm(`Tem certeza que deseja excluir a planta ${plantaId} do pedido ${pedidoId}?`)) {
        return;
    }
    fetch(`${API_BASE_URL}/pedido_has_planta/${pedidoId}/${plantaId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                row.remove();
                mostrarMensagem('Item excluído com sucesso!', 'success');
            } else if (response.status === 404) {
                mostrarMensagem('Erro: Item não encontrado no servidor.', 'error');
            } else {
                throw new Error('Erro ao excluir o item do pedido.');
            }
        })
        .catch(error => {
            mostrarMensagem(error.message || 'Erro ao excluir item', 'error');
        });
}
