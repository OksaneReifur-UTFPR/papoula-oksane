// =========================================================
// pagamento.js - Código Completo
// Implementa CRUD para a tabela de Pagamento.
// =========================================================

const API_BASE_URL = 'http://localhost:3000'; 
const BASE_PATH = '/pagamento'; 

let currentPagamentoId = null; // ID Pagamento (chave primária)
let operacao = null;           // 'incluir' | 'alterar'

// --- Elementos do DOM ---
const searchId = document.getElementById('searchId');

const id_pagamentoInput = document.getElementById('id_pagamento');
const id_pedidoInput = document.getElementById('id_pedido');
const data_pagamentoInput = document.getElementById('data_pagamento');
const valor_total_pagamentoInput = document.getElementById('valor_total_pagamento');

// Botões
const btnBuscar = document.getElementById('btnBuscar');
const btnLimpar = document.getElementById('btnLimpar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');

// Listagem e Mensagens
const tableBody = document.getElementById('pagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

// =================================================================
// FUNÇÕES DE CONTROLE DE ESTADO E UI (Interface)
// =================================================================

/**
 * Gerencia a visibilidade dos botões de ação.
 */
const gerenciarBotoes = ({ buscar = true, limpar = true, incluir = false, alterar = false, excluir = false, salvar = false }) => {
    if (btnBuscar) btnBuscar.style.display = buscar ? 'inline-flex' : 'none';
    if (btnLimpar) btnLimpar.style.display = limpar ? 'inline-flex' : 'none';
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
 */
function setFormState(isEditable) {
    // Campos de dados
    id_pedidoInput.disabled = !isEditable;
    data_pagamentoInput.disabled = !isEditable;
    valor_total_pagamentoInput.disabled = !isEditable;

    // Campo de busca e ID PK
    searchId.disabled = isEditable;
    id_pagamentoInput.disabled = true; // PK nunca é editável, só preenchido
    
    // Na alteração, ID Pedido também fica bloqueado para manter a integridade
    if (operacao === 'alterar') {
        id_pedidoInput.disabled = true;
    }

    if (!isEditable) {
        operacao = null;
        gerenciarBotoes({ incluir: true, buscar: true, limpar: true }); // Estado inicial
    } else {
        // Modo edição/inclusão
        gerenciarBotoes({ salvar: true, limpar: true });
    }
}

/**
 * Preenche os campos do formulário com os dados do registro.
 */
function preencherFormulario(data) {
    id_pagamentoInput.value = data.id_pagamento;
    id_pedidoInput.value = data.id_pedido;
    valor_total_pagamentoInput.value = data.valor_total_pagamento;
    // Formata data para o input type="date"
    data_pagamentoInput.value = data.data_pagamento ? data.data_pagamento.split('T')[0] : '';
}

/**
 * Reseta o formulário para o estado inicial de busca.
 */
function limparFormulario() {
    currentPagamentoId = null;
    operacao = null;
    
    // Limpa campos
    searchId.value = '';
    id_pagamentoInput.value = '';
    id_pedidoInput.value = '';
    data_pagamentoInput.value = '';
    valor_total_pagamentoInput.value = '';
    
    // Configura estado inicial 
    setFormState(false);
    searchId.focus();
    
    // Recarrega a lista
    carregarRegistros();
}

/**
 * Prepara o formulário para a inclusão de um novo registro.
 */
function prepararInclusao() {
    // Limpa apenas os campos de dados e IDs, mas mantém o estado de busca limpo
    id_pagamentoInput.value = '';
    id_pedidoInput.value = '';
    data_pagamentoInput.value = '';
    valor_total_pagamentoInput.value = '';
    currentPagamentoId = null; // Garante que será um POST (nova inclusão)

    // Se o usuário digitou um ID na busca, usamos ele para a inclusão da PK
    const suggestedId = searchId.value.trim();
    if (suggestedId) {
        id_pagamentoInput.value = suggestedId;
        currentPagamentoId = parseInt(suggestedId);
    }

    operacao = 'incluir';
    setFormState(true); // Habilita campos de dados (incluindo ID Pedido)
    id_pedidoInput.focus();
    gerenciarBotoes({ salvar: true, limpar: true });
    mostrarMensagem('Modo Inclusão: Preencha os dados e salve.');
}

/**
 * Prepara o formulário para a alteração de um registro existente.
 */
function prepararAlteracao() {
    if (currentPagamentoId === null) {
        mostrarMensagem('Busque um registro primeiro para alterar.');
        return;
    }
    operacao = 'alterar';
    // Habilita os campos editáveis (Data e Valor Total)
    data_pagamentoInput.disabled = false;
    valor_total_pagamentoInput.disabled = false;
    
    // Bloqueia ID e ID Pedido (o Pagamento deve ser imutável após a criação)
    id_pagamentoInput.disabled = true;
    id_pedidoInput.disabled = true;
    searchId.disabled = true;
    
    data_pagamentoInput.focus();
    gerenciarBotoes({ salvar: true, excluir: true, limpar: true });
    mostrarMensagem('Modo Alteração: Edite a Data/Valor e clique em Salvar.');
}

// =================================================================
// FUNÇÕES DE COMUNICAÇÃO COM A API (CRUD)
// =================================================================

/**
 * Busca um registro na API pelo ID.
 */
async function buscarRegistro() {
    const pId = searchId.value.trim();

    if (!pId) {
        mostrarMensagem('Preencha o ID do Pagamento para buscar.');
        limparFormulario();
        return;
    }

    try {
        const url = `${API_BASE_URL}${BASE_PATH}/${pId}`;
        const res = await fetch(url);
        
        if (res.ok) {
            const registro = await res.json();
            currentPagamentoId = parseInt(pId);
            
            preencherFormulario(registro);
            
            // Estado de registro existente
            setFormState(false);
            gerenciarBotoes({ alterar: true, excluir: true, limpar: true, buscar: true });
            mostrarMensagem(`Pagamento ID ${pId} encontrado.`);
        } else if (res.status === 404) {
            // Não encontrado, prepara para inclusão
            limparFormulario();
            searchId.value = pId;
            prepararInclusao();
            mostrarMensagem('Pagamento não encontrado. Preencha os dados para incluí-lo.');
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
    
    const pId = parseInt(id_pagamentoInput.value);
    const idPedido = parseInt(id_pedidoInput.value);
    const valorTotal = parseFloat(valor_total_pagamentoInput.value);
    const dataPagamento = data_pagamentoInput.value;
    
    // Validação básica
    if (isNaN(pId) || isNaN(idPedido) || isNaN(valorTotal) || !dataPagamento) {
        mostrarMensagem('Todos os campos (ID, ID Pedido, Valor Total e Data) são obrigatórios.');
        return;
    }

    const isNew = operacao === 'incluir';
    let msgSuccess = isNew ? 'Pagamento incluído com sucesso!' : 'Pagamento alterado com sucesso!';
    
    try {
        const registroData = {
            id_pagamento: pId,
            id_pedido: idPedido,
            data_pagamento: dataPagamento,
            valor_total_pagamento: valorTotal
        };
        
        let method = isNew ? 'POST' : 'PUT';
        let url = isNew 
            ? `${API_BASE_URL}${BASE_PATH}` 
            : `${API_BASE_URL}${BASE_PATH}/${currentPagamentoId}`;
        
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
 * Exclui o registro pelo ID.
 */
async function excluirRegistro() {
    if (currentPagamentoId === null) return;

    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o Pagamento ID ${currentPagamentoId}? Esta ação é irreversível.`)) {
        return;
    }

    try {
        const url = `${API_BASE_URL}${BASE_PATH}/${currentPagamentoId}`;
        const res = await fetch(url, {
            method: 'DELETE'
        });

        if (res.status === 204 || res.ok) {
            mostrarMensagem('Pagamento excluído com sucesso!');
            limparFormulario();
        } else {
            throw new Error('Falha ao excluir o registro.');
        }

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
        if (!res.ok) throw new Error('Falha ao carregar lista de pagamentos.');
        const registros = await res.json();
        
        tableBody.innerHTML = '';
        
        registros.forEach(r => {
            const row = document.createElement('tr');
            
            // Colunas no HTML: ID, ID Pedido, Valor Total, Data Pagamento
            row.innerHTML = `
                <td>${escapeHtml(r.id_pagamento)}</td>
                <td>${escapeHtml(r.id_pedido)}</td>
                <td>${formatMoney(r.valor_total_pagamento)}</td>
                <td>${formatDate(r.data_pagamento)}</td>
            `;
            // Adiciona evento de clique para carregar o registro na tabela
            row.onclick = () => {
                searchId.value = r.id_pagamento;
                buscarRegistro();
            };
            tableBody.appendChild(row);
        });
    } catch (err) {
        mostrarMensagem('Erro ao carregar lista de pagamentos: ' + err.message, 5000);
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
    btnExcluir.addEventListener('click', excluirRegistro); // Exclusão direta com confirmação
    btnSalvar.addEventListener('click', salvarOperacao);
    
    // permitir buscar ao pressionar Enter nos campos de busca
    if (searchId) {
        searchId.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarRegistro();
            }
        });
    }
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