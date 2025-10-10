const API_BASE_URL = 'http://localhost:3000';
let currentCPF = null;
let operacao = null;

// Elementos
const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const messageContainer = document.getElementById('messageContainer');

const chkFuncionario = document.getElementById('chkFuncionario');
const cargoSelect = document.getElementById('cargopessoa');
const salarioInput = document.getElementById('salario');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarCargos();
  carregarPessoas();
  carregarClientes();
  carregarFuncionarios();
});

mostrarBotoes(true, false, false, false, false, true);
bloquearCampos(false);

// Funções utilitárias
function mostrarMensagem(msg, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${msg}</div>`;
  setTimeout(() => (messageContainer.innerHTML = ''), 3000);
}

function limparFormulario() { form.reset(); }

function bloquearCampos(ativar) {
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.id !== 'chkFuncionario') input.disabled = !ativar;
  });
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
  btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
  btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
  btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
  btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
  btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
  btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Eventos principais
btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnSalvar.addEventListener('click', salvarOperacao);
btnCancelar.addEventListener('click', cancelarOperacao);

chkFuncionario.addEventListener('change', () => {
  cargoSelect.disabled = !chkFuncionario.checked;
  salarioInput.style.display = chkFuncionario.checked ? 'inline-block' : 'none';
  if (!chkFuncionario.checked) {
    cargoSelect.value = '';
    salarioInput.value = '';
  }
});

// ---------------------------------------------------------------------------
// Buscar Pessoa
async function buscarPessoa() {
  const cpf = searchId.value.trim();
  if (!cpf) return mostrarMensagem('Digite um CPF para buscar', 'warning');

  try {
    const res = await fetch(`${API_BASE_URL}/pessoa/${cpf}`);
    if (res.ok) {
      const pessoa = await res.json();
      preencherFormulario(pessoa);
      mostrarBotoes(true, false, true, true, false, true);
      mostrarMensagem('Pessoa encontrada!', 'success');
    } else if (res.status === 404) {
      limparFormulario();
      searchId.value = cpf;
      mostrarMensagem('Pessoa não encontrada. Você pode incluir.', 'info');
      mostrarBotoes(true, true, false, false, false, true);
      bloquearCampos(false);
    }
  } catch {
    mostrarMensagem('Erro ao buscar pessoa', 'error');
  }
}

function preencherFormulario(pessoa) {
  currentCPF = pessoa.cpf_pessoa;
  document.getElementById('cpf_pessoa').value = pessoa.cpf_pessoa;
  document.getElementById('nome_pessoa').value = pessoa.nome_pessoa;
  document.getElementById('data_nascimento_pessoa').value =
    pessoa.data_nascimento_pessoa?.split('T')[0] || '';
}

// ---------------------------------------------------------------------------
// Incluir / Alterar / Excluir
function incluirPessoa() {
  mostrarMensagem('Digite os dados!', 'info');
  limparFormulario();
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  operacao = 'incluir';
}

function alterarPessoa() {
  mostrarMensagem('Altere os dados e clique em Salvar.', 'info');
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  operacao = 'alterar';
}

function excluirPessoa() {
  operacao = 'excluir';
  salvarOperacao();
}

// ---------------------------------------------------------------------------
// Salvar operação
async function salvarOperacao() {
  const pessoa = {
    cpf_pessoa: document.getElementById('cpf_pessoa').value,
    nome_pessoa: document.getElementById('nome_pessoa').value,
    data_nascimento_pessoa: document.getElementById('data_nascimento_pessoa').value
  };

  const funcionario = chkFuncionario.checked
    ? {
        cpf_pessoa: pessoa.cpf_pessoa,
        salario: salarioInput.value,
        id_cargo: cargoSelect.value
      }
    : null;

  try {
    if (operacao === 'incluir') {
      await fetch(`${API_BASE_URL}/pessoa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
      });

      if (funcionario) {
        await fetch(`${API_BASE_URL}/funcionario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(funcionario)
        });
      } else {
        await fetch(`${API_BASE_URL}/cliente`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpf_cliente: pessoa.cpf_pessoa,
            data_cadastro: new Date().toISOString()
          })
        });
      }
    }

    if (operacao === 'alterar') {
      await fetch(`${API_BASE_URL}/pessoa/${currentCPF}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoa)
      });

      if (funcionario) {
        await fetch(`${API_BASE_URL}/funcionario/${currentCPF}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(funcionario)
        });
        await fetch(`${API_BASE_URL}/cliente/${currentCPF}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_BASE_URL}/cliente/${currentCPF}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data_cadastro: new Date().toISOString() })
        });
        await fetch(`${API_BASE_URL}/funcionario/${currentCPF}`, { method: 'DELETE' });
      }
    }

    if (operacao === 'excluir') {
      await fetch(`${API_BASE_URL}/pessoa/${currentCPF}`, { method: 'DELETE' });
    }

    mostrarMensagem(`Operação ${operacao} concluída!`, 'success');
    limparFormulario();
    carregarPessoas();
    carregarClientes();
    carregarFuncionarios();
  } catch {
    mostrarMensagem('Erro ao salvar operação', 'error');
  }

  mostrarBotoes(true, false, false, false, false, true);
  bloquearCampos(false);
}

// ---------------------------------------------------------------------------
// Cancelar
function cancelarOperacao() {
  limparFormulario();
  mostrarMensagem('Operação cancelada', 'info');
  mostrarBotoes(true, false, false, false, false, true);
  bloquearCampos(false);
}

// ---------------------------------------------------------------------------
// Carregar dados
async function carregarCargos() {
  try {
    const res = await fetch(`${API_BASE_URL}/cargo`);
    const cargos = await res.json();
    cargoSelect.innerHTML = '<option value="">Selecione um cargo</option>';
    cargos.forEach(c => {
      const op = document.createElement('option');
      op.value = c.id_cargo;
      op.textContent = c.nome_cargo;
      cargoSelect.appendChild(op);
    });
  } catch {
    mostrarMensagem('Erro ao carregar cargos', 'error');
  }
}

async function carregarPessoas() {
  try {
    const res = await fetch(`${API_BASE_URL}/pessoa`);
    const pessoas = await res.json();
    const tbody = document.getElementById('pessoasTableBody');
    tbody.innerHTML = '';
    pessoas.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><button class="btn-primary btn-small" onclick="selecionarPessoa('${p.cpf_pessoa}')">${p.cpf_pessoa}</button></td>
        <td>${p.nome_pessoa}</td>
        <td>${p.data_nascimento_pessoa ? new Date(p.data_nascimento_pessoa).toLocaleDateString('pt-BR') : ''}</td>
        <td>${p.cargo || 'Cliente'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    mostrarMensagem('Erro ao carregar pessoas', 'error');
  }
}

async function carregarClientes() {
  try {
    const res = await fetch(`${API_BASE_URL}/cliente`);
    const clientes = await res.json();
    const tbody = document.getElementById('clienteTableBody');
    tbody.innerHTML = '';
    clientes.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.cpf_cliente}</td>
        <td>${c.data_cadastro ? new Date(c.data_cadastro).toLocaleDateString('pt-BR') : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    mostrarMensagem('Erro ao carregar clientes', 'error');
  }
}

async function carregarFuncionarios() {
  try {
    const res = await fetch(`${API_BASE_URL}/funcionario`);
    const funcs = await res.json();
    const tbody = document.getElementById('funcionariosTableBody');
    tbody.innerHTML = '';
    funcs.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.cpf_pessoa}</td>
        <td>${f.salario}</td>
        <td>${f.nome_cargo || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    mostrarMensagem('Erro ao carregar funcionários', 'error');
  }
}

async function selecionarPessoa(cpf) {
  searchId.value = cpf;
  await buscarPessoa();
}

// Abas
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.target).classList.add('active');
  });
});
