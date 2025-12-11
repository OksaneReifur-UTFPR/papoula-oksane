// Front-end adaptado ao seu controller / rota: formadepagamento
// Ajuste API_BASE_URL se necessário
const API_BASE_URL = 'http://localhost:3000';
const BASE_PATH = '/formadepagamento'; // monte o router no backend com este caminho

let currentId = null;
let operacao = null;

// DOM
const form = document.getElementById('formadePagamentoForm');
const searchId = document.getElementById('searchId');
const inputId = document.getElementById('id_formadepagamento');
const inputNome = document.getElementById('nome_formadepagamento');

const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');

const tableBody = document.getElementById('formadepagamentoTableBody');
const messageContainer = document.getElementById('messageContainer');

// Init
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  carregarFormaPagamentos();
  resetUI();
});

// Bind events
function bindEvents() {
  btnBuscar.addEventListener('click', buscarFormaPagamento);
  btnIncluir.addEventListener('click', iniciarInclusao);
  btnAlterar.addEventListener('click', iniciarAlteracao);
  btnExcluir.addEventListener('click', iniciarExclusao);
  btnSalvar.addEventListener('click', salvarOperacao);
  btnCancelar.addEventListener('click', cancelarOperacao);

  // Enter in search
  searchId.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); buscarFormaPagamento(); } });
}

// UI helpers
function showMessage(text, type = 'info', timeout = 3500) {
  if (!messageContainer) return;
  messageContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
  if (timeout > 0) setTimeout(() => { messageContainer.innerHTML = ''; }, timeout);
}

function resetUI() {
  currentId = null;
  operacao = null;
  form.reset();
  inputId.disabled = false;
  searchId.disabled = false;
  toggleButtons({ buscar: true, incluir: true, alterar: false, excluir: false, salvar: false, cancelar: true });
}

function toggleButtons({ buscar = true, incluir = true, alterar = false, excluir = false, salvar = false, cancelar = true }) {
  btnBuscar.style.display = buscar ? 'inline-block' : 'none';
  btnIncluir.style.display = incluir ? 'inline-block' : 'none';
  btnAlterar.style.display = alterar ? 'inline-block' : 'none';
  btnExcluir.style.display = excluir ? 'inline-block' : 'none';
  btnSalvar.style.display = salvar ? 'inline-block' : 'none';
  btnCancelar.style.display = cancelar ? 'inline-block' : 'none';
}

function setEditable(editable) {
  inputNome.disabled = !editable;
  inputId.disabled = !editable; // allow editing ID only in inclusion mode if desired
}

// CRUD operations
async function carregarFormaPagamentos() {
  try {
    const resp = await fetch(`${API_BASE_URL}${BASE_PATH}`);
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const data = await resp.json();
    const list = Array.isArray(data) ? data : (data.rows || []);
    renderTabela(list);
  } catch (err) {
    console.error('Erro carregar formas:', err);
    showMessage('Erro ao carregar formas de pagamento', 'error', 5000);
  }
}

function renderTabela(items = []) {
  tableBody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><button class="btn-id" data-id="${item.id_formadepagamento}">${escapeHtml(item.id_formadepagamento)}</button></td>
      <td>${escapeHtml(item.nome_formadepagamento)}</td>
    `;
    tr.querySelector('.btn-id').addEventListener('click', () => selecionarFormaPagamento(item.id_formadepagamento));
    tableBody.appendChild(tr);
  });
}

async function buscarFormadePagamento() {
  const id = searchId.value.trim();
  if (!id) { showMessage('Digite um ID para buscar', 'warning'); return; }
  try {
    const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${id}`);
    if (resp.ok) {
      const data = await resp.json();
      preencherFormulario(data);
      showMessage('Registro encontrado', 'success');
      toggleButtons({ buscar: true, incluir: false, alterar: true, excluir: true, salvar: false, cancel: false });
      inputId.disabled = true;
      setEditable(false);
      currentId = data.id_formadepagamento;
    } else if (resp.status === 404) {
      // prepare for inclusion with given id
      form.reset();
      searchId.value = id;
      inputId.value = id;
      inputNome.focus();
      operacao = 'incluir';
      toggleButtons({ buscar: true, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
      setEditable(true);
      showMessage('Registro não encontrado. Preencha os dados para incluir.', 'info');
    } else {
      const err = await resp.json().catch(()=>({error:'Erro'}));
      throw new Error(err.error || 'Erro na busca');
    }
  } catch (err) {
    console.error(err);
    showMessage('Erro ao buscar registro', 'error');
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
  toggleButtons({ buscar: false, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
  showMessage('Modo inclusão ativado', 'info');
}

function iniciarAlteracao() {
  if (!currentId) { showMessage('Busque um registro primeiro', 'warning'); return; }
  operacao = 'alterar';
  setEditable(true);
  inputId.disabled = true;
  inputNome.focus();
  toggleButtons({ buscar: false, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
  showMessage('Modo alteração ativado', 'info');
}

function iniciarExclusao() {
  if (!currentId) { showMessage('Busque um registro primeiro', 'warning'); return; }
  operacao = 'excluir';
  toggleButtons({ buscar: false, incluir: false, alterar: false, excluir: false, salvar: true, cancelar: true });
  showMessage('Confirme exclusão clicando em Salvar', 'warning');
}

async function salvarOperacao() {
  const payload = {
    id_formadepagamento: inputId.value ? Number(inputId.value) : undefined,
    nome_formadepagamento: inputNome.value && inputNome.value.trim() !== '' ? inputNome.value.trim() : undefined
  };

  try {
    if (operacao === 'incluir') {
      if (!payload.nome_formadepagamento) { showMessage('Nome é obrigatório', 'warning'); return; }
      const resp = await fetch(`${API_BASE_URL}${BASE_PATH}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (resp.ok || resp.status === 201) {
        const created = await resp.json().catch(()=>null);
        showMessage('Registro incluído com sucesso', 'success');
        resetAfterChange();
      } else {
        const err = await resp.json().catch(()=>({error:'Erro'}));
        throw new Error(err.error || 'Erro ao incluir');
      }
    } else if (operacao === 'alterar') {
      if (!currentId) { showMessage('Nenhum registro selecionado', 'warning'); return; }
      if (!payload.nome_formadepagamento) { showMessage('Nome é obrigatório', 'warning'); return; }
      const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${currentId}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ nome_formadepagamento: payload.nome_formadepagamento })
      });
      if (resp.ok) {
        showMessage('Registro atualizado com sucesso', 'success');
        resetAfterChange();
      } else {
        const err = await resp.json().catch(()=>({error:'Erro'}));
        throw new Error(err.error || 'Erro ao atualizar');
      }
    } else if (operacao === 'excluir') {
      if (!currentId) { showMessage('Nenhum registro selecionado', 'warning'); return; }
      const resp = await fetch(`${API_BASE_URL}${BASE_PATH}/${currentId}`, {
        method: 'DELETE'
      });
      if (resp.status === 204 || resp.ok) {
        showMessage('Registro excluído com sucesso', 'success');
        resetAfterChange();
      } else {
        const err = await resp.json().catch(()=>({error:'Erro'}));
        throw new Error(err.error || 'Erro ao excluir');
      }
    } else {
      showMessage('Nenhuma operação ativa', 'warning');
    }
  } catch (err) {
    console.error(err);
    showMessage(err.message || 'Erro na operação', 'error', 6000);
  }
}

function cancelarOperacao() {
  resetUI();
  showMessage('Operação cancelada', 'info');
}

function resetAfterChange() {
  carregarFormadePagamentos();
  resetUI();
}

// selecionar via tabela
async function selecionarFormadePagamento(id) {
  searchId.value = id;
  await buscarFormadePagamento();
}

// util
function escapeHtml(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}