// =========================================================
// pagamento_has_formapagamento.js - Código Completo
// Implementa CRUD para a tabela de vínculo com chave composta.
// =========================================================

const API_BASE_URL = 'http://localhost:3000'; 
// Assumindo que o endpoint para esta tabela seja: /pagamento_has_formapagamento
const BASE_PATH = '/pagamento_has_formapagamento'; 

let currentPagamentoId = null; // ID Pagamento (chave 1)
let currentFormaId = null;     // ID Forma de Pagamento (chave 2)
let operacao = null;           // 'incluir' | 'alterar'

// --- Elementos do DOM ---
const searchPagamentoId = document.getElementById('searchPagamentoId');
const searchFormaId = document.getElementById('searchFormaId');

const id_pagamentoPedidoInput = document.getElementById('id_pagamentoPedido');
const id_formaDePagamentoInput = document.getElementById('id_formaDePagamento');
const valor_pagoInput = document.getElementById('valor_pago');
const data_pagamentoInput = document.getElementById('data_pagamento');

// Botões
const btnBuscar = document.getElementById('btnBuscar');
const btnLimpar = document.getElementById('btnLimpar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');

// Listagem e Mensagens
const tableBody = document.getElementById('pagamentoHasFormTableBody');
const messageContainer = document.getElementById('messageContainer');

// =================================================================
// FUNÇÕES DE CONTROLE DE ESTADO E UI (Interface)
// =================================================================

/**
 * Gerencia a visibilidade dos botões de ação.
 */
const gerenciarBotoes = ({ incluir = false, alterar = false, excluir = false, salvar = false }) => {
    if (btnIncluir) btnIncluir.style.display = incluir ? 'inline-flex' : 'none';
    if (btnAlterar) btnAlterar.style.display = alterar ? 'inline-flex' : 'none';
    if (btnExcluir) btnExcluir.style.display = excluir ? 'inline-flex' : 'none';
    if (btnSalvar) btnSalvar.style.display = salvar ? 'inline-flex' : 'none';
};

/**
 * Exibe uma mensagem de notificação temporária.
 */
const mostrarMensagem = (texto, tempo = 3500) => {
    if (!messageContainer) return;
    messageContainer.textContent = texto;
    messageContainer.classList.add('show');
    setTimeout(() => messageContainer.classList.remove('show'), tempo);
};

/**
 * Habilita ou desabilita os campos do formulário para edição.
 * Nota: Os campos de ID (chave) só devem ser habilitados na Inclusão.
 */
function setFormState(isEditable) {
    valor_pagoInput.disabled = !isEditable;
    data_pagamentoInput.disabled = !isEditable;

    // Campos de busca sempre desabilitados se estiver no modo edição
    searchPagamentoId.disabled = isEditable;
    searchFormaId.disabled = isEditable;

    if (!isEditable) {
        operacao = null;
        // Os IDs (chave composta) são sempre desabilitados se não estiver salvando
        id_pagamentoPedidoInput.disabled = true;
        id_formaDePagamentoInput.disabled = true;
        gerenciarBotoes({}); // Limpa todos os botões
    } else {
        // Modo edição
        gerenciarBotoes({ salvar: true });
        // Se for Alteração, IDs continuam desabilitados
        if (operacao === 'alterar') {
             id_pagamentoPedidoInput.disabled = true;
             id_formaDePagamentoInput.disabled = true;
        } else if (operacao === 'incluir') {
             // Na inclusão, os IDs devem ser preenchidos e estão habilitados
             id_pagamentoPedidoInput.disabled = false;
             id_formaDePagamentoInput.disabled = false;
        }
    }
}

/**
 * Preenche os campos do formulário com os dados do registro.
 */
function preencherFormulario(data) {
    id_pagamentoPedidoInput.value = data.id_pagamentoPedido;
    id_formaDePagamentoInput.value = data.id_formaDePagamento;
    valor_pagoInput.value = data.valor_pago;
    data_pagamentoInput.value = data.data_pagamento ? data.data_pagamento.split('T')[0] : '';
}

/**
 * Reseta o formulário para o estado inicial de busca.
 */
function limparFormulario() {
    currentPagamentoId = null;
    currentFormaId = null;
    operacao = null;
    
    // Limpa campos
    searchPagamentoId.value = '';
    searchFormaId.value = '';
    id_pagamentoPedidoInput.value = '';
    id_formaDePagamentoInput.value = '';
    valor_pagoInput.value = '';
    data_pagamentoInput.value = '';
    
    // Configura estado inicial (somente busca habilitada)
    setFormState(false);
    searchPagamentoId.disabled = false;
    searchFormaId.disabled = false;
    searchPagamentoId.focus();
    
    // Recarrega a lista
    carregarRegistros();
}

/**
 * Prepara o formulário para a inclusão de um novo registro.
 */
function prepararInclusao() {
    const pId = searchPagamentoId.value.trim();
    const fId = searchFormaId.value.trim();

    if (!pId || !fId) {
        mostrarMensagem('O ID do Pagamento e o ID da Forma de Pagamento devem ser preenchidos para iniciar a inclusão.');
        return;
    }
    
    // Define os IDs da chave primária composta
    currentPagamentoId = parseInt(pId);
    currentFormaId = parseInt(fId);

    // Limpa apenas os campos de dados e busca
    valor_pagoInput.value = '';
    data_pagamentoInput.value = '';
    
    // Preenche os campos de chave primária para a inclusão
    id_pagamentoPedidoInput.value = currentPagamentoId;
    id_formaDePagamentoInput.value = currentFormaId;

    operacao = 'incluir';
    setFormState(true); // Habilita todos os campos, incluindo IDs
    valor_pagoInput.focus();
    gerenciarBotoes({ salvar: true });
    mostrarMensagem('Modo Inclusão: Preencha o Valor Pago e Data, e salve.');
}

/**
 * Prepara o formulário para a alteração de um registro existente.
 */
function prepararAlteracao() {
    if (currentPagamentoId === null || currentFormaId === null) {
        mostrarMensagem('Busque um registro primeiro para alterar.');
        return;
    }
    operacao = 'alterar';
    setFormState(true);
    valor_pagoInput.focus();
    gerenciarBotoes({ salvar: true, excluir: true });
    mostrarMensagem('Modo Alteração: Edite o Valor/Data e clique em Salvar.');
}

/**
 * Prepara para exclusão (apenas um passo de confirmação).
 */
function prepararExclusao() {
    if (currentPagamentoId === null || currentFormaId === null) {
        mostrarMensagem('Busque um registro primeiro para excluir.');
        return;
    }
    excluirRegistro();
}

// =================================================================
// FUNÇÕES DE COMUNICAÇÃO COM A API (CRUD)
// =================================================================

/**
 * Busca um registro na API pela chave composta.
 */
async function buscarRegistro() {
    const pId = searchPagamentoId.value.trim();
    const fId = searchFormaId.value.trim();

    if (!pId || !fId) {
        mostrarMensagem('Preencha os IDs do Pagamento e da Forma para buscar.');
        limparFormulario();
        return;
    }

    try {
        // Endpoint: BASE_PATH/:id_pagamentoPedido/:id_formaDePagamento
        const url = `${API_BASE_URL}${BASE_PATH}/${pId}/${fId}`;
        const res = await fetch(url);
        
        if (res.ok) {
            const registro = await res.json();
            currentPagamentoId = parseInt(pId);
            currentFormaId = parseInt(fId);
            
            preencherFormulario(registro);
            
            // Estado de registro existente
            setFormState(false);
            gerenciarBotoes({ alterar: true, excluir: true });
            mostrarMensagem(`Vínculo ID Pagamento ${pId} / ID Forma ${fId} encontrado.`);
        } else if (res.status === 404) {
            // Não encontrado, prepara para inclusão com as chaves digitadas
            prepararInclusao();
            mostrarMensagem('Vínculo não encontrado. Preencha os dados para incluí-lo.');
        } else {
            throw new Error('Erro ao buscar o registro.');
        }
    } catch (err) {
        mostrarMensagem(err.message || 'Erro de comunicação com o servidor.');
        limparFormulario();
    }
}


/**
 * Salva (inclui ou altera) o registro.
 */
async function salvarOperacao() {
    if (operacao !== 'incluir' && operacao !== 'alterar') return;
    
    const pId = parseInt(id_pagamentoPedidoInput.value);
    const fId = parseInt(id_formaDePagamentoInput.value);
    const valorPago = parseFloat(valor_pagoInput.value);
    const dataPagamento = data_pagamentoInput.value;
    
    // Validação básica
    if (isNaN(pId) || isNaN(fId) || isNaN(valorPago) || !dataPagamento) {
        mostrarMensagem('Todos os campos (IDs, Valor Pago e Data) são obrigatórios.');
        return;
    }

    const isNew = operacao === 'incluir';
    let msgSuccess = isNew ? 'Vínculo incluído com sucesso!' : 'Vínculo alterado com sucesso!';
    
    try {
        const registroData = {
            id_pagamentoPedido: pId,
            id_formaDePagamento: fId,
            valor_pago: valorPago,
            data_pagamento: dataPagamento
        };
        
        let method = isNew ? 'POST' : 'PUT';
        // Para POST, o endpoint é a rota base. Para PUT, o endpoint é a chave composta.
        let url = isNew 
            ? `${API_BASE_URL}${BASE_PATH}` 
            : `${API_BASE_URL}${BASE_PATH}/${pId}/${fId}`;
        
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registroData)
        });

        if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Falha na API: ${res.statusText}. Detalhe: ${errorBody.substring(0, 100)}...`);
        }
        
        mostrarMensagem(msgSuccess);
        limparFormulario();
    } catch (error) {
        mostrarMensagem(`Erro ao salvar: ${error.message}`);
    }
}


/**
 * Exclui o registro pela chave composta.
 */
async function excluirRegistro() {
    if (currentPagamentoId === null || currentFormaId === null) return;

    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o vínculo Pagamento ${currentPagamentoId} e Forma ${currentFormaId}?`)) {
        return;
    }

    try {
        const url = `${API_BASE_URL}${BASE_PATH}/${currentPagamentoId}/${currentFormaId}`;
        const res = await fetch(url, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error('Falha ao excluir o registro.');
        }

        mostrarMensagem('Vínculo excluído com sucesso!');
        limparFormulario();
    } catch (err) {
        mostrarMensagem(err.message || 'Erro ao tentar excluir o registro.');
    }
}


/**
 * Carrega a lista de todos os registros para a tabela.
 */
async function carregarRegistros() {
    try {
        const res = await fetch(`${API_BASE_URL}${BASE_PATH}`);
        if (!res.ok) throw new Error('Falha ao carregar lista de registros.');
        const registros = await res.json();
        
        tableBody.innerHTML = '';
        
        registros.forEach(r => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${escapeHtml(r.id_pagamentoPedido)}</td>
                <td>${escapeHtml(r.id_formaDePagamento)}</td>
                <td>${formatMoney(r.valor_pago)}</td>
                <td>${formatDate(r.data_pagamento)}</td>
            `;
            // Adiciona evento de clique para carregar o registro na tabela
            row.onclick = () => {
                searchPagamentoId.value = r.id_pagamentoPedido;
                searchFormaId.value = r.id_formaDePagamento;
                buscarRegistro();
            };
            tableBody.appendChild(row);
        });
    } catch (err) {
        mostrarMensagem('Erro ao carregar lista de registros: ' + err.message, 5000);
    }
}


// =================================================================
// FUNÇÕES AUXILIARES E INICIALIZAÇÃO
// =================================================================

/**
 * Formata strings de data para o padrão brasileiro.
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString.split('T')[0] || dateString;
    return d.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Formata valores para moeda Real (R$).
 */
function formatMoney(v) {
    if (v === undefined || v === null) return 'N/A';
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Escapa HTML para prevenir XSS.
 */
function escapeHtml(s) {
  return String(s || '').replace(/[&<>\"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"\'":'&#39;'}[m]));
}

/**
 * Cria corações flutuantes para o efeito visual do tema.
 */
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨']; 
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.top = `${5 + Math.random() * 90}vh`;
        heart.style.fontSize = `${0.8 + Math.random() * 0.8}rem`;
        heart.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(heart);
    }
}

/**
 * Associa todos os eventos aos elementos do DOM.
 */
function bindEvents() {
    btnBuscar.addEventListener('click', buscarRegistro);
    btnLimpar.addEventListener('click', limparFormulario);
    btnIncluir.addEventListener('click', prepararInclusao);
    btnAlterar.addEventListener('click', prepararAlteracao);
    btnExcluir.addEventListener('click', prepararExclusao);
    btnSalvar.addEventListener('click', salvarOperacao);
    
    // permitir buscar ao pressionar Enter nos campos de busca
    const searchInputs = [searchPagamentoId, searchFormaId];
    searchInputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarRegistro();
            }
        });
    });
}

/**
 * Função de inicialização principal.
 */
async function inicializar() {
    bindEvents();
    await carregarRegistros();
    limparFormulario(); // Define o estado inicial após carregar os dados
    createFloatingHearts();
}

// Inicia a aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializar);