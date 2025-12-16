// Front-end adaptado com tema romântico para floricultura
const API_BASE_URL = 'http://localhost:3000';
const BASE_PATH = '/formadepagamento';

let currentId = null;
let operacao = null;

// DOM Elements
const form = document.getElementById('formaPagamentoForm');
const searchId = document.getElementById('searchId');
const inputId = document.getElementById('id_formadepagamento');
const inputNome = document.getElementById('nome_formadepagamento');

const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

const tableBody = document.getElementById('forma_pagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Inicialização com tema romântico
document.addEventListener('DOMContentLoaded', () => {
  console.log('💐 Sistema de Formas de Pagamento - Lindos Detalles');
  
  bindEvents();
  carregarFormaPagamentos();
  resetUI();
  setupAnimations();
});

// Configurar animações
function setupAnimations() {
  // Adiciona classe de carregamento aos botões durante operações
  const buttons = [btnBuscar, btnIncluir, btnAlterar, btnExcluir, btnSalvar];
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.id === 'btnSalvar') return; // Não anima o salvar
      this.classList.add('animate-pulse');
      setTimeout(() => this.classList.remove('animate-pulse'), 300);
    });
  });
}

// Bind events com feedback tátil
function bindEvents() {
  btnBuscar.addEventListener('click', () => {
    btnBuscar.classList.add('loading');
    setTimeout(() => btnBuscar.classList.remove('loading'), 500);
    buscarFormaPagamento();
  });
  
  btnIncluir.addEventListener('click', iniciarInclusao);
  btnAlterar.addEventListener('click', iniciarAlteracao);
  btnExcluir.addEventListener('click', iniciarExclusao);
  btnSalvar.addEventListener('click', salvarOperacao);
  btnCancelar.addEventListener('click', cancelarOperacao);

  // Enter na busca
  searchId.addEventListener('keydown', (e) => { 
    if (e.key === 'Enter') { 
      e.preventDefault(); 
      buscarFormaPagamento(); 
    } 
  });

  // Feedback visual nos inputs
  [inputId, inputNome, searchId].forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });
}

// UI helpers com tema romântico
function showMessage(text, type = 'info', timeout = 4000) {
  if (!messageContainer) return;
  
  // Remove mensagens anteriores
  messageContainer.innerHTML = '';
  
  // Cria nova mensagem
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  
  // Adiciona ícone baseado no tipo
  let icon = '💡';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';
  else if (type === 'info') icon = '💡';
  
  messageDiv.innerHTML = `${icon} ${text}`;
  
  messageContainer.appendChild(messageDiv);
  
  // Remove após timeout
  if (timeout > 0) {
    setTimeout(() => {
      messageDiv.style.animation = 'slideInFromRight 0.5s reverse';
      setTimeout(() => {
        if (messageDiv.parentElement) {
          messageDiv.remove();
        }
      }, 500);
    }, timeout);
  }
}

function resetUI() {
  currentId = null;
  operacao = null;
  form.reset();
  inputId.disabled = false;
  searchId.disabled = false;
  toggleButtons({ 
    buscar: true, 
    incluir: true, 
    alterar: false, 
    excluir: false, 
    salvar: false, 
    cancelar: true 
  });
  
  // Reset visual
  inputId.classList.remove('valid', 'invalid');
  inputNome.classList.remove('valid', 'invalid');
  searchId.classList.remove('valid', 'invalid');
}

function toggleButtons(states) {
  btnBuscar.style.display = states.buscar ? 'inline-block' : 'none';
  btnIncluir.style.display = states.incluir ? 'inline-block' : 'none';
  btnAlterar.style.display = states.alterar ? 'inline-block' : 'none';
  btnExcluir.style.display = states.excluir ? 'inline-block' : 'none';
  btnSalvar.style.display = states.salvar ? 'inline-block' : 'none';
  btnCancelar.style.display = states.cancelar ? 'inline-block' : 'none';
}

function setEditable(editable) {
  inputNome.disabled = !editable;
  inputId.disabled = !editable;
  
  // Feedback visual
  if (editable) {
    inputNome.classList.add('editable');
    inputId.classList.add('editable');
  } else {
    inputNome.classList.remove('editable');
    inputId.classList.remove('editable');
  }
}

// CRUD operations com feedback visual melhorado
async function carregarFormaPagamentos() {
  try {
    // Mostra estado de carregamento
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 3rem;">
          <div class="loading" style="font-size: 2rem; margin-bottom: 1rem;">🌸</div>
          <p style="color: var(--text-light);">Buscando formas de pagamento...</p>
        </td>
      </tr>
    `;
    
    const resp = await fetch(`${API_BASE_URL}${BASE_PATH}`);
    
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    
    const data = await resp.json();
    const list = Array.isArray(data) ? data : (data.rows || []);
    
    renderTabela(list);
    
    if (list.length === 0) {
      showMessage('Nenhuma forma de pagamento cadastrada ainda.', 'info');
    }
    
  } catch (err) {
    console.error('Erro carregar formas:', err);
    
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 3rem; color: #FF5252;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🥀</div>
          <p>Erro ao carregar formas de pagamento</p>
          <small style="opacity: 0.7;">${err.message}</small>
        </td>
      </tr>
    `;
    
    showMessage('Erro ao carregar formas de pagamento', 'error', 5000);
  }
}

function renderTabela(items = []) {
  tableBody.innerHTML = '';
  
  if (items.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; padding: 3rem; color: var(--text-light);">
          <div style="font-size: 2rem; margin-bottom: 1rem;">🌱</div>
          <p>Nenhuma forma de pagamento cadastrada</p>
          <small style="opacity: 0.7;">Clique em "Incluir" para adicionar uma nova</small>
        </td>
      </tr>
    `;
    return;
  }
  
  items.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.05}s`;
    tr.classList.add('fade-in-row');
    
    tr.innerHTML = `
      <td>
        <button class="btn-id" data-id="${item.id_formadepagamento}" 
                aria-label="Selecionar forma de pagamento ${item.id_formadepagamento}">
          ${escapeHtml(item.id_formadepagamento)}
        </button>
      </td>
      <td>${escapeHtml(item.nome_formadepagamento)}</td>
    `;
    
    tr.querySelector('.btn-id').addEventListener('click', () => {
      selecionarFormaPagamento(item.id_formadepagamento);
      // Feedback visual
      tr.querySelector('.btn-id').classList.add('selected');
      setTimeout(() => tr.querySelector('.btn-id').classList.remove('selected'), 1000);
    });
    
    tableBody.appendChild(tr);
  });
}

async function buscarFormaPagamento() {
  const id = searchId.value.trim();
  
  if (!id) { 
    showMessage('Digite um ID para buscar', 'warning'); 
    return; 
  }
  
  try {
    btnBuscar.classList.add('loading');
    btnBuscar.disabled = true;
    
    const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${id}`);
    
    if (resp.ok) {
      const data = await resp.json();
      preencherFormulario(data);
      showMessage('🌸 Registro encontrado!', 'success');
      toggleButtons({ 
        buscar: true, 
        incluir: false, 
        alterar: true, 
        excluir: true, 
        salvar: false, 
        cancelar: true 
      });
      inputId.disabled = true;
      setEditable(false);
      currentId = data.id_formadepagamento;
      
      // Highlight visual
      inputId.classList.add('valid');
      inputNome.classList.add('valid');
      
    } else if (resp.status === 404) {
      // Preparar para inclusão com ID fornecido
      form.reset();
      searchId.value = id;
      inputId.value = id;
      inputNome.focus();
      operacao = 'incluir';
      toggleButtons({ 
        buscar: true, 
        incluir: false, 
        alterar: false, 
        excluir: false, 
        salvar: true, 
        cancelar: true 
      });
      setEditable(true);
      showMessage('🌱 Registro não encontrado. Preencha os dados para incluir.', 'info');
      
    } else {
      const err = await resp.json().catch(() => ({ error: 'Erro' }));
      throw new Error(err.error || 'Erro na busca');
    }
    
  } catch (err) {
    console.error(err);
    showMessage('🥀 Erro ao buscar registro', 'error');
    inputId.classList.add('invalid');
    
  } finally {
    btnBuscar.classList.remove('loading');
    btnBuscar.disabled = false;
  }
}

function preencherFormulario(data) {
  currentId = data.id_formadepagamento;
  inputId.value = data.id_formadepagamento;
  inputNome.value = data.nome_formadepagamento || '';
}

function iniciarInclusao() {
  operacao = 'incluir';
  form.reset();
  inputId.value = '';
  setEditable(true);
  inputId.disabled = false;
  inputNome.focus();
  toggleButtons({ 
    buscar: false, 
    incluir: false, 
    alterar: false, 
    excluir: false, 
    salvar: true, 
    cancelar: true 
  });
  showMessage('✨ Modo inclusão ativado', 'info');
}

function iniciarAlteracao() {
  if (!currentId) { 
    showMessage('Busque um registro primeiro', 'warning'); 
    return; 
  }
  
  operacao = 'alterar';
  setEditable(true);
  inputId.disabled = true;
  inputNome.focus();
  toggleButtons({ 
    buscar: false, 
    incluir: false, 
    alterar: false, 
    excluir: false, 
    salvar: true, 
    cancelar: true 
  });
  showMessage('✏️ Modo alteração ativado', 'info');
}

function iniciarExclusao() {
  if (!currentId) { 
    showMessage('Busque um registro primeiro', 'warning'); 
    return; 
  }
  
  // Confirmação visual mais amigável
  if (!confirm('🌺 Tem certeza que deseja excluir esta forma de pagamento?')) {
    return;
  }
  
  operacao = 'excluir';
  toggleButtons({ 
    buscar: false, 
    incluir: false, 
    alterar: false, 
    excluir: false, 
    salvar: true, 
    cancelar: true 
  });
  showMessage('⚠️ Clique em Salvar para confirmar a exclusão', 'warning');
}

async function salvarOperacao() {
  const payload = {
    id_formadepagamento: inputId.value ? Number(inputId.value) : undefined,
    nome_formadepagamento: inputNome.value && inputNome.value.trim() !== '' ? inputNome.value.trim() : undefined
  };

  try {
    btnSalvar.classList.add('loading');
    btnSalvar.disabled = true;
    
    if (operacao === 'incluir') {
      if (!payload.nome_formadepagamento) { 
        showMessage('Nome é obrigatório', 'warning'); 
        return; 
      }
      
      const resp = await fetch(`${API_BASE_URL}${BASE_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (resp.ok || resp.status === 201) {
        const created = await resp.json().catch(() => null);
        showMessage('✅ Registro incluído com sucesso!', 'success');
        resetAfterChange();
        
        // Animação de confete visual
        confettiEffect();
      } else {
        const err = await resp.json().catch(() => ({ error: 'Erro' }));
        throw new Error(err.error || 'Erro ao incluir');
      }
      
    } else if (operacao === 'alterar') {
      if (!currentId) { 
        showMessage('Nenhum registro selecionado', 'warning'); 
        return; 
      }
      
      if (!payload.nome_formadepagamento) { 
        showMessage('Nome é obrigatório', 'warning'); 
        return; 
      }
      
      const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${currentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_formadepagamento: payload.nome_formadepagamento })
      });
      
      if (resp.ok) {
        showMessage('✅ Registro atualizado com sucesso!', 'success');
        resetAfterChange();
      } else {
        const err = await resp.json().catch(() => ({ error: 'Erro' }));
        throw new Error(err.error || 'Erro ao atualizar');
      }
      
    } else if (operacao === 'excluir') {
      if (!currentId) { 
        showMessage('Nenhum registro selecionado', 'warning'); 
        return; 
      }
      
      const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${currentId}`, {
        method: 'DELETE'
      });
      
      if (resp.status === 204 || resp.ok) {
        showMessage('🗑️ Registro excluído com sucesso', 'success');
        resetAfterChange();
      } else {
        const err = await resp.json().catch(() => ({ error: 'Erro' }));
        throw new Error(err.error || 'Erro ao excluir');
      }
      
    } else {
      showMessage('Nenhuma operação ativa', 'warning');
    }
    
  } catch (err) {
    console.error(err);
    showMessage(`❌ ${err.message || 'Erro na operação'}`, 'error', 6000);
  } finally {
    btnSalvar.classList.remove('loading');
    btnSalvar.disabled = false;
  }
}

function cancelarOperacao() {
  resetUI();
  showMessage('Operação cancelada', 'info');
}

function resetAfterChange() {
  carregarFormaPagamentos();
  resetUI();
}

// Selecionar via tabela
async function selecionarFormaPagamento(id) {
  searchId.value = id;
  await buscarFormaPagamento();
}

// Efeito de confete visual para sucesso
function confettiEffect() {
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none';
  confettiContainer.style.zIndex = '9999';
  
  const flowers = ['🌸', '🌺', '🌹', '🌷', '💮', '🌼'];
  
  for (let i = 0; i < 15; i++) {
    const confetti = document.createElement('div');
    confetti.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    confetti.style.position = 'absolute';
    confetti.style.fontSize = '1.5rem';
    confetti.style.opacity = '0.7';
    confetti.style.top = '-50px';
    confetti.style.left = `${Math.random() * 100}%`;
    
    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 0.7 },
      { transform: `translateY(${window.innerHeight + 100}px) rotate(${360 * (Math.random() > 0.5 ? 1 : -1)}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 1000,
      easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
    });
    
    confettiContainer.appendChild(confetti);
    
    animation.onfinish = () => confetti.remove();
  }
  
  document.body.appendChild(confettiContainer);
  setTimeout(() => confettiContainer.remove(), 3000);
}

// Util
function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// CSS dinâmico para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInRow {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .fade-in-row {
    animation: fadeInRow 0.3s ease-out forwards;
    opacity: 0;
  }
  
  .animate-pulse {
    animation: pulse 0.3s ease-in-out;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .focused {
    transform: translateY(-2px);
  }
  
  .selected {
    background: linear-gradient(135deg, var(--rose-medium), var(--rose-dark)) !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4) !important;
  }
  
  .valid {
    border-color: var(--leaf-green) !important;
    background-color: rgba(168, 213, 186, 0.1) !important;
  }
  
  .invalid {
    border-color: #FF5252 !important;
    background-color: rgba(255, 82, 82, 0.05) !important;
  }
  
  .editable {
    border-color: var(--rose-medium) !important;
    box-shadow: 0 0 0 2px rgba(255, 182, 193, 0.2) !important;
  }
`;
document.head.appendChild(style);