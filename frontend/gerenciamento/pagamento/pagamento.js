// =========================================================
// pagamento.js - Código Completo
// Implementa CRUD para Forma de Pagamento com controle de estado.
// =========================================================

const API_BASE_URL = 'http://localhost:3000'; // Ajuste conforme a porta do seu servidor

let currentId = null;       // ID da forma de pagamento atualmente carregada
let operacao = null;        // 'incluir' | 'alterar'

// --- Elementos do DOM ---
const searchId = document.getElementById('searchId');
const nomeInput = document.getElementById('nome_forma_pagamento');

// Botões
const btnBuscar = document.getElementById('btnBuscar');
const btnCancelar = document.getElementById('btnCancelar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');

// Listagem e Mensagens
const forma_pagamentosTableBody = document.getElementById('forma_pagamentosTableBody');
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
 * Habilita ou desabilita os campos comuns para edição.
 */
function setFormState(isEditable) {
    nomeInput.disabled = !isEditable;
    searchId.disabled = isEditable; // Desabilita busca se estiver editando

    if (!isEditable) {
        operacao = null;
        gerenciarBotoes({}); // Limpa todos os botões
    }
}

/**
 * Reseta o formulário para o estado inicial de busca.
 */
function limparFormulario(clearSearch = true) {
    currentId = null;
    operacao = null;
    
    // Limpa campos
    if (clearSearch) searchId.value = '';
    nomeInput.value = '';
    
    // Configura estado inicial (somente busca habilitada)
    setFormState(false);
    searchId.disabled = false;
    searchId.focus();
    
    // Recarrega a lista
    carregarForma_pagamentos();
}

/**
 * Prepara o formulário para a inclusão de um novo registro.
 */
function prepararInclusao() {
    if (searchId.value.trim() === '') {
        mostrarMensagem('O ID (ou deixe o campo vazio para inclusão automática, se suportado pela API) precisa ser considerado para inclusão.');
        // Se a API gerar ID, apenas limpe o campo e passe para edição
        limparFormulario(true); 
        currentId = null;
    } else {
        // Se o usuário digitou um ID, use-o
        currentId = parseInt(searchId.value);
    }
    
    nomeInput.value = '';
    operacao = 'incluir';
    setFormState(true);
    nomeInput.focus();
    gerenciarBotoes({ salvar: true });
    mostrarMensagem('Modo Inclusão: Preencha o nome e salve.');
}

/**
 * Prepara o formulário para a alteração de um registro existente.
 */
function prepararAlteracao() {
    if (currentId === null) {
        mostrarMensagem('Busque uma forma de pagamento primeiro para alterar.');
        return;
    }
    operacao = 'alterar';
    setFormState(true);
    nomeInput.focus();
    // No modo alteração, a exclusão também deve ser possível
    gerenciarBotoes({ salvar: true, excluir: true });
    mostrarMensagem('Modo Alteração: Edite o nome e clique em Salvar.');
}

/**
 * Prepara para exclusão (apenas um passo de confirmação).
 */
function prepararExclusao() {
    if (currentId === null) {
        mostrarMensagem('Busque uma forma de pagamento primeiro para excluir.');
        return;
    }
    excluirForma_pagamento();
}

// =================================================================
// FUNÇÕES DE COMUNICAÇÃO COM A API (CRUD)
// =================================================================

/**
 * Busca uma forma de pagamento na API pelo ID.
 */
async function buscarForma_pagamento() {
    const id = searchId.value.trim();
    if (id === '') {
        mostrarMensagem('Por favor, digite o ID para buscar ou clique em Limpar para incluir.');
        limparFormulario(false);
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/forma_pagamento/${id}`);
        
        if (res.ok) {
            const pagamento = await res.json();
            currentId = pagamento.id_forma_pagamento;
            
            // Popula campos
            nomeInput.value = pagamento.nome_forma_pagamento;
            
            // Estado de registro existente
            setFormState(false);
            gerenciarBotoes({ alterar: true, excluir: true });
            mostrarMensagem(`Forma de Pagamento (ID ${currentId}) encontrada.`);
        } else if (res.status === 404) {
            // Não encontrado, prepara para inclusão com o ID digitado
            currentId = parseInt(id);
            prepararInclusao();
            mostrarMensagem(`ID ${id} não encontrado. Preencha o nome para incluí-lo.`);
        } else {
            throw new Error('Erro ao buscar forma de pagamento.');
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

    const nome = nomeInput.value.trim();
    
    // Validação básica
    if (!nome) {
        mostrarMensagem('O Nome da Forma de Pagamento é obrigatório.');
        return;
    }

    const isNew = operacao === 'incluir';
    let msgSuccess = isNew ? 'Forma de Pagamento incluída com sucesso!' : 'Forma de Pagamento alterada com sucesso!';
    
    try {
        const pagamentoData = {
            nome_forma_pagamento: nome
        };
        
        let method = isNew ? 'POST' : 'PUT';
        let url = isNew ? `${API_BASE_URL}/forma_pagamento` : `${API_BASE_URL}/forma_pagamento/${currentId}`;
        
        // Se for inclusão e o ID foi preenchido, adiciona o ID no body (se a API suportar)
        if (isNew && currentId !== null && !isNaN(currentId)) {
             pagamentoData.id_forma_pagamento = currentId;
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pagamentoData)
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
 * Exclui a forma de pagamento pelo ID.
 */
async function excluirForma_pagamento() {
    if (currentId === null) return;

    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE a Forma de Pagamento ID ${currentId} (${nomeInput.value})?`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/forma_pagamento/${currentId}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error('Falha ao excluir o registro.');
        }

        mostrarMensagem('Forma de Pagamento excluída com sucesso!');
        limparFormulario();
    } catch (err) {
        mostrarMensagem(err.message || 'Erro ao tentar excluir a forma de pagamento.');
    }
}


/**
 * Carrega a lista de formas de pagamento para a tabela.
 */
async function carregarForma_pagamentos() {
    try {
        const res = await fetch(`${API_BASE_URL}/forma_pagamento`);
        if (!res.ok) throw new Error('Falha ao carregar lista de formas de pagamento.');
        const pagamentos = await res.json();
        
        forma_pagamentosTableBody.innerHTML = '';
        
        pagamentos.forEach(p => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${escapeHtml(p.id_forma_pagamento)}</td>
                <td>${escapeHtml(p.nome_forma_pagamento)}</td>
            `;
            // Adiciona evento de clique para carregar o registro na tabela
            row.onclick = () => {
                searchId.value = p.id_forma_pagamento;
                buscarForma_pagamento();
            };
            forma_pagamentosTableBody.appendChild(row);
        });
    } catch (err) {
        mostrarMensagem('Erro ao carregar lista: ' + err.message, 5000);
    }
}


// =================================================================
// FUNÇÕES AUXILIARES E INICIALIZAÇÃO
// =================================================================

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
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨', '💖', '💕', '🌸', '💓', '💞']; 
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        // Posicionamento levemente lateral e com top variado para dar o efeito de flutuação
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
    btnBuscar.addEventListener('click', buscarForma_pagamento);
    btnCancelar.addEventListener('click', limparFormulario);
    btnIncluir.addEventListener('click', prepararInclusao);
    btnAlterar.addEventListener('click', prepararAlteracao);
    btnExcluir.addEventListener('click', prepararExclusao);
    btnSalvar.addEventListener('click', salvarOperacao);
    
    // permitir buscar ao pressionar Enter no campo de busca
    searchId.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarForma_pagamento();
        }
    });
}

/**
 * Função de inicialização principal.
 */
async function inicializar() {
    bindEvents();
    await carregarForma_pagamentos();
    limparFormulario(); // Define o estado inicial após carregar os dados
    createFloatingHearts();
}

// Inicia a aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializar);