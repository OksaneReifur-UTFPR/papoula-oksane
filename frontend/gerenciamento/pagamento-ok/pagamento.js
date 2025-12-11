// Front-end para /pagamento (adaptado ao controller fornecido)
// Ajuste API_BASE_URL se necessário (ex.: 'http://localhost:3001')
const API_BASE_URL = 'http://localhost:3001';
const BASE_PATH = '/pagamento'; // rota montada no backend (use exatamente o mount do router)

let currentPagamentoId = null;
let operacao = null;

// DOM elements
const form = document.getElementById('pagamentoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pagamentosTableBody = document.getElementById('pagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

// inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarPagamentos();
    bindEvents();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
});

function bindEvents() {
    if (btnBuscar) btnBuscar.addEventListener('click', buscarPagamento);
    if (btnIncluir) btnIncluir.addEventListener('click', incluirPagamento);
    if (btnAlterar) btnAlterar.addEventListener('click', alterarPagamento);
    if (btnExcluir) btnExcluir.addEventListener('click', excluirPagamento);
    if (btnCancelar) btnCancelar.addEventListener('click', cancelarOperacao);
    if (btnSalvar) btnSalvar.addEventListener('click', salvarOperacao);
}

// helpers de UI
function mostrarMensagem(texto, tipo = 'info', duration = 4000) {
    if (!messageContainer) return;
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    if (duration > 0) setTimeout(() => { messageContainer.innerHTML = ''; }, duration);
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach((input, index) => {
        if (index === 0) {
            input.disabled = bloquearPrimeiro;
        } else {
            input.disabled = !bloquearPrimeiro;
        }
    });
}

function limparFormulario() {
    form.reset();
    currentPagamentoId = null;
    operacao = null;
}

// CRUD functions
async function carregarPagamentos() {
    try {
        const resp = await fetch(`${API_BASE_URL}${BASE_PATH}`, { credentials: 'include' });
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        renderizarTabelaPagamentos(Array.isArray(data) ? data : (data.rows || []));
    } catch (err) {
        console.error('Erro carregar pagamentos:', err);
        mostrarMensagem('Erro ao carregar lista de pagamentos', 'error', 6000);
    }
}

function renderizarTabelaPagamentos(pagamentos = []) {
    pagamentosTableBody.innerHTML = '';
    pagamentos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><button class="btn-id" data-id="${p.id_pagamento}">${p.id_pagamento}</button></td>
            <td>${escapeHtml(p.id_pedido)}</td>
            <td>${p.data_pagamento ? escapeHtml(p.data_pagamento.split('T')[0]) : ''}</td>
            <td>${escapeHtml(Number(p.valor_total_pagamento).toFixed(2))}</td>
            <td>${escapeHtml(p.cpf_cliente || '')}</td>
            <td>${p.data_pedido ? escapeHtml(p.data_pedido.split('T')[0]) : ''}</td>
        `;
        const btn = tr.querySelector('.btn-id');
        btn.addEventListener('click', () => selecionarPagamento(p.id_pagamento));
        pagamentosTableBody.appendChild(tr);
    });
}

async function buscarPagamento() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    try {
        const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${id}`, { credentials: 'include' });
        if (resp.ok) {
            const pagamento = await resp.json();
            preencherFormulario(pagamento);
            mostrarBotoes(true, false, true, true, false, false);
            mostrarMensagem('Pagamento encontrado!', 'success');
            bloquearCampos(true);
        } else if (resp.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            mostrarMensagem('Pagamento não encontrado. Você pode incluir um novo.', 'info');
            bloquearCampos(false);
            document.getElementById('id_pedido').focus();
        } else {
            const err = await resp.json().catch(()=>({error:'Erro'}));
            throw new Error(err.error || 'Erro ao buscar pagamento');
        }
    } catch (err) {
        console.error('Erro buscar pagamento:', err);
        mostrarMensagem('Erro ao buscar pagamento', 'error');
    }
}

function preencherFormulario(pagamento) {
    currentPagamentoId = pagamento.id_pagamento;
    searchId.value = pagamento.id_pagamento;
    document.getElementById('id_pedido').value = pagamento.id_pedido || '';
    document.getElementById('data_pagamento').value = pagamento.data_pagamento ? pagamento.data_pagamento.split('T')[0] : '';
    document.getElementById('valor_total_pagamento').value = pagamento.valor_total_pagamento || '';
}

function incluirPagamento() {
    mostrarMensagem('Digite os dados do novo pagamento', 'info');
    limparFormulario();
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('id_pedido').focus();
    operacao = 'incluir';
}

function alterarPagamento() {
    if (!currentPagamentoId) {
        mostrarMensagem('Busque um pagamento primeiro', 'warning');
        return;
    }
    mostrarMensagem('Altere os dados do pagamento', 'info');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('id_pedido').focus();
    operacao = 'alterar';
}

function excluirPagamento() {
    if (!currentPagamentoId) {
        mostrarMensagem('Busque um pagamento primeiro', 'warning');
        return;
    }
    mostrarMensagem('Excluindo pagamento...', 'warning');
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
}

async function salvarOperacao() {
    const formData = new FormData(form);
    const pagamentoPayload = {
        id_pedido: formData.get('id_pedido'),
        data_pagamento: formData.get('data_pagamento'),
        valor_total_pagamento: Number(formData.get('valor_total_pagamento'))
    };

    try {
        let resp;
        if (operacao === 'incluir') {
            resp = await fetch(`${API_BASE_URL}${BASE_PATH}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(pagamentoPayload)
            });
            if (resp.status === 201 || resp.ok) {
                mostrarMensagem('Pagamento incluído com sucesso!', 'success');
                limparFormulario();
                carregarPagamentos();
            } else {
                const err = await resp.json().catch(()=>({error:'Erro'}));
                throw new Error(err.error || 'Erro ao incluir pagamento');
            }
        } else if (operacao === 'alterar') {
            if (!currentPagamentoId) { mostrarMensagem('Nenhum pagamento selecionado', 'warning'); return; }
            resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${currentPagamentoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(pagamentoPayload)
            });
            if (resp.ok) {
                mostrarMensagem('Pagamento atualizado com sucesso!', 'success');
                limparFormulario();
                carregarPagamentos();
            } else {
                const err = await resp.json().catch(()=>({error:'Erro'}));
                throw new Error(err.error || 'Erro ao atualizar pagamento');
            }
        } else if (operacao === 'excluir') {
            if (!currentPagamentoId) { mostrarMensagem('Nenhum pagamento selecionado', 'warning'); return; }
            resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${currentPagamentoId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (resp.status === 204 || resp.ok) {
                mostrarMensagem('Pagamento excluído com sucesso!', 'success');
                limparFormulario();
                carregarPagamentos();
            } else {
                const err = await resp.json().catch(()=>({error:'Erro'}));
                throw new Error(err.error || 'Erro ao excluir pagamento');
            }
        } else {
            mostrarMensagem('Nenhuma operação selecionada', 'warning');
        }
    } catch (err) {
        console.error('Erro salvarOperacao:', err);
        mostrarMensagem(err.message || 'Erro na operação', 'error', 6000);
    } finally {
        mostrarBotoes(true, false, false, false, false, false);
        bloquearCampos(false);
        searchId.disabled = false;
        searchId.focus();
        operacao = null;
    }
}

function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchId.disabled = false;
    searchId.focus();
    mostrarMensagem('Operação cancelada', 'info');
}

async function selecionarPagamento(id) {
    searchId.value = id;
    await buscarPagamento();
}

// util
function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}