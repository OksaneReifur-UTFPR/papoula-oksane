// pagamento.js (versão alinhada com o HTML acima)
const API_BASE_URL = 'http://localhost:3000';

let currentPersonId = null;
let operacao = null;

const form = document.getElementById('forma_pagamentoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const forma_pagamentosTableBody = document.getElementById('forma_pagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

document.addEventListener('DOMContentLoaded', () => {
    carregarForma_pagamentos();
    initFloatingHearts();

    btnBuscar.addEventListener('click', buscarForma_pagamento);
    btnIncluir.addEventListener('click', incluirForma_pagamento);
    btnAlterar.addEventListener('click', alterarForma_pagamento);
    btnExcluir.addEventListener('click', excluirForma_pagamento);
    btnCancelar.addEventListener('click', cancelarOperacao);
    btnSalvar.addEventListener('click', salvarOperacao);

    mostrarBotoes(true, true, false, false, false, false);
    bloquearCampos(false);
});

function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        if (messageContainer.firstChild) messageContainer.innerHTML = '';
    }, 3500);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    inputs.forEach((input, index) => {
        if (index === 0) {
            input.disabled = !!bloquearPrimeiro;
        } else {
            input.disabled = !bloquearPrimeiro;
        }
    });
}

function limparFormulario() {
    form.reset();
    currentPersonId = null;
    operacao = null;
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// helper: retorna primeiro campo existente no objeto entre várias opções
function getField(obj, ...names) {
    if (!obj) return '';
    for (const n of names) {
        if (Object.prototype.hasOwnProperty.call(obj, n) && obj[n] !== undefined && obj[n] !== null) {
            return obj[n];
        }
        // tentar variações simples (camelCase)
        const camel = n.replace(/_([a-z])/g, g => g[1].toUpperCase());
        if (Object.prototype.hasOwnProperty.call(obj, camel) && obj[camel] !== undefined && obj[camel] !== null) {
            return obj[camel];
        }
    }
    return '';
}

async function buscarForma_pagamento() {
    const id = (searchId.value || '').toString().trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        searchId.focus();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/formaPagamento/${encodeURIComponent(id)}`);
        if (response.ok) {
            const forma_pagamento = await response.json();
            preencherFormulario(forma_pagamento);
            mostrarBotoes(true, false, true, true, false, true);
            bloquearCampos(false);
            mostrarMensagem('Forma de pagamento encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id; // manter o que o usuário digitou
            mostrarBotoes(true, true, false, false, false, true);
            bloquearCampos(true);
            mostrarMensagem('Não encontrado. Você pode incluir um novo registro.', 'info');
            const nomeField = document.getElementById('nome_forma_pagamento');
            if (nomeField) nomeField.focus();
        } else {
            const txt = await response.text();
            console.error('Erro ao buscar:', response.status, txt);
            mostrarMensagem('Erro ao buscar forma de pagamento', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro de conexão ao buscar forma de pagamento', 'error');
    }
}

function preencherFormulario(forma_pagamento) {
    if (!forma_pagamento) return;

    // mapeamento tolerante a diferentes nomes vindos do servidor
    const idVal = getField(forma_pagamento,
        'id_forma_pagamento', 'id_formadepagamento', 'id', 'idFormaPagamento');
    const nomeVal = getField(forma_pagamento,
        'nome_forma_pagamento', 'nome_formadepagamento', 'nome', 'nomeFormaPagamento');

    currentPersonId = idVal || null;

    // proteger contra atribuição de undefined em inputs
    searchId.value = (idVal !== undefined && idVal !== null) ? idVal : '';
    const nomeField = document.getElementById('nome_forma_pagamento');
    if (nomeField) nomeField.value = (nomeVal !== undefined && nomeVal !== null) ? nomeVal : '';
}

function incluirForma_pagamento() {
    operacao = 'incluir';
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    const nomeField = document.getElementById('nome_forma_pagamento');
    if (nomeField) { nomeField.value = ''; nomeField.focus(); }
    mostrarMensagem('Preencha os dados e clique em Salvar.', 'info');
}

function alterarForma_pagamento() {
    if (!searchId.value) {
        mostrarMensagem('Busque um registro antes de alterar.', 'warning');
        return;
    }
    operacao = 'alterar';
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    const nomeField = document.getElementById('nome_forma_pagamento');
    if (nomeField) nomeField.focus();
    mostrarMensagem('Altere os dados e clique em Salvar.', 'info');
}

function excluirForma_pagamento() {
    if (!searchId.value) {
        mostrarMensagem('Busque um registro antes de excluir.', 'warning');
        return;
    }
    operacao = 'excluir';
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    mostrarMensagem('Clique em Salvar para confirmar exclusão.', 'warning');
}

async function salvarOperacao() {
    const idRaw = (searchId.value || '').toString().trim();
    const id = idRaw ? Number(idRaw) : null;
    // usa name compatível com o HTML: nome_forma_pagamento
    const nome = (new FormData(form)).get('nome_forma_pagamento') || '';

    if ((operacao === 'incluir' || operacao === 'alterar') && (!nome || !nome.trim())) {
        mostrarMensagem('Preencha o nome da forma de pagamento.', 'warning');
        const nomeField = document.getElementById('nome_forma_pagamento');
        if (nomeField) nomeField.focus();
        return;
    }

    try {
        let response;
        if (operacao === 'incluir') {
            const payload = { nome_forma_pagamento: nome.trim() };
            response = await fetch(`${API_BASE_URL}/forma_pagamento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (operacao === 'alterar') {
            if (id === null) { mostrarMensagem('ID inválido para alterar.', 'error'); return; }
            const payload = { id_forma_pagamento: id, nome_forma_pagamento: nome.trim() };
            response = await fetch(`${API_BASE_URL}/forma_pagamento/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (operacao === 'excluir') {
            if (id === null) { mostrarMensagem('ID inválido para excluir.', 'error'); return; }
            response = await fetch(`${API_BASE_URL}/forma_pagamento/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
        } else {
            mostrarMensagem('Nenhuma operação selecionada.', 'warning');
            return;
        }

        if (response.ok) {
            mostrarMensagem(
                operacao === 'incluir' ? 'Registro incluído!' :
                operacao === 'alterar' ? 'Registro alterado!' : 'Registro excluído!',
                'success'
            );
            limparFormulario();
            carregarForma_pagamentos();
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            searchId.focus();
        } else {
            let errMsg = `Erro: ${response.status}`;
            try {
                const errJson = await response.json();
                errMsg = errJson.error || errJson.message || JSON.stringify(errJson);
            } catch (e) {
                const txt = await response.text();
                if (txt) errMsg = txt;
            }
            console.error('Erro resposta:', response.status, errMsg);
            mostrarMensagem(errMsg, 'error');
        }
    } catch (error) {
        console.error('Erro na operação:', error);
        mostrarMensagem('Erro de conexão ao realizar a operação', 'error');
    } finally {
        operacao = null;
    }
}

function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, true, false, false, false, false);
    bloquearCampos(false);
    searchId.focus();
    mostrarMensagem('Operação cancelada', 'info');
}

async function carregarForma_pagamentos() {
    try {
        const response = await fetch(`${API_BASE_URL}/forma_pagamento`);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const forma_pagamentos = await response.json();
        renderizarTabelaForma_pagamentos(Array.isArray(forma_pagamentos) ? forma_pagamentos : []);
    } catch (error) {
        console.error('Erro ao carregar lista:', error);
        mostrarMensagem('Erro ao carregar lista de formas de pagamento', 'error');
    }
}

function renderizarTabelaForma_pagamentos(forma_pagamentos) {
    forma_pagamentosTableBody.innerHTML = '';
    forma_pagamentos.forEach(forma_pagamento => {
        const idVal = getField(forma_pagamento, 'id_forma_pagamento', 'id_formadepagamento', 'id');
        const nomeVal = getField(forma_pagamento, 'nome_forma_pagamento', 'nome_formadepagamento', 'nome');

        const row = document.createElement('tr');

        const tdId = document.createElement('td');
        const btnId = document.createElement('button');
        btnId.type = 'button';
        btnId.className = 'btn-id';
        btnId.textContent = (idVal !== undefined && idVal !== null) ? idVal : '';
        btnId.addEventListener('click', () => selecionarForma_pagamento(idVal));
        tdId.appendChild(btnId);

        const tdNome = document.createElement('td');
        tdNome.textContent = (nomeVal !== undefined && nomeVal !== null) ? nomeVal : '';

        row.appendChild(tdId);
        row.appendChild(tdNome);
        forma_pagamentosTableBody.appendChild(row);
    });
}

async function selecionarForma_pagamento(id) {
    if (id === undefined || id === null) return;
    searchId.value = id;
    await buscarForma_pagamento();
}

function initFloatingHearts() {
    const leftContainer = document.querySelector('.floating-hearts');
    const rightContainer = document.querySelector('.side-hearts');
    if (!leftContainer || !rightContainer) return;
    const emojis = ['💝', '💕', '🩷', '💖', '💞', '💗'];
    const LEFT_COUNT = 10, RIGHT_COUNT = 10;
    createHearts(leftContainer, LEFT_COUNT, 'heart');
    createHearts(rightContainer, RIGHT_COUNT, 'side-heart');
    function createHearts(container, count, klass) {
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.className = klass;
            el.setAttribute('aria-hidden', 'true');
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = Math.random() * 100 + '%';
            el.style.top = Math.random() * 100 + '%';
            const size = 12 + Math.random() * 28;
            el.style.fontSize = size + 'px';
            el.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
            el.style.animationDelay = (Math.random() * 0.5) + 's';
            el.style.filter = 'drop-shadow(0 2px 4px rgba(255, 107, 157, 0.4))';
            container.appendChild(el);
        }
    }
}