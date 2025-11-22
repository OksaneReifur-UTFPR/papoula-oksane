// cadastro-pessoa.js
// Integrado com endpoints: /pessoa, /cliente, /funcionario, /cargo
const API_BASE_URL = 'http://localhost:3000';

let currentCPF = null;      // CPF atualmente carregado no formulário
let currentTipo = null;     // 'cliente' | 'funcionario' | null

// DOM
const searchId = document.getElementById('searchId');
const cpfsList = document.getElementById('cpfsList');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimpar = document.getElementById('btnLimpar');
const btnSalvar = document.getElementById('btnSalvar');
const btnExcluir = document.getElementById('btnExcluir');

const nomeInput = document.getElementById('nome_pessoa');
const nascInput = document.getElementById('data_nascimento_pessoa');
const tipoSelect = document.getElementById('tipo_pessoa');

const funcionarioFields = document.getElementById('funcionarioFields');
const salarioInput = document.getElementById('salario');
const cargoSelect = document.getElementById('id_cargo');

const clienteFields = document.getElementById('clienteFields');
const dataCadastroInput = document.getElementById('data_cadastro');

const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  inicializar();
});

function bindEvents() {
  btnBuscar.addEventListener('click', buscarPessoa);
  btnLimpar.addEventListener('click', limparFormulario);
  btnSalvar.addEventListener('click', salvarOperacao);
  btnExcluir.addEventListener('click', excluirRegistro);
  tipoSelect.addEventListener('change', handleTipoChange);
  searchId.addEventListener('keydown', e => { if (e.key === 'Enter') buscarPessoa(); });
}

async function inicializar() {
  showMessage('Carregando...', 'info');
  await Promise.all([carregarCargos(), carregarSugestoesCPFs(), carregarListaCompleta()]);
  showMessage('Pronto ✨', 'success', 900);
  limparFormulario();
}

/* ---------- UI helpers ---------- */
function showMessage(text, type = 'info', duration = 3000) {
  messageContainer.textContent = text;
  messageContainer.className = `toast ${type}`;
  if (duration > 0) {
    setTimeout(() => {
      messageContainer.className = 'toast';
      messageContainer.textContent = '';
    }, duration);
  }
}

function toggleConditionalFields() {
  const tipo = tipoSelect.value;
  if (tipo === 'funcionario') {
    funcionarioFields.style.display = 'block';
    funcionarioFields.setAttribute('aria-hidden', 'false');
    clienteFields.style.display = 'none';
    clienteFields.setAttribute('aria-hidden', 'true');
  } else if (tipo === 'cliente') {
    clienteFields.style.display = 'block';
    clienteFields.setAttribute('aria-hidden', 'false');
    funcionarioFields.style.display = 'none';
    funcionarioFields.setAttribute('aria-hidden', 'true');
  } else {
    funcionarioFields.style.display = 'none';
    funcionarioFields.setAttribute('aria-hidden', 'true');
    clienteFields.style.display = 'none';
    clienteFields.setAttribute('aria-hidden', 'true');
  }
}

/* ---------- Carregamento inicial (cargos, CPFs e lista) ---------- */
async function carregarCargos() {
  try {
    const res = await fetch(`${API_BASE_URL}/cargo`);
    if (!res.ok) throw new Error('Falha ao carregar cargos');
    const cargos = await res.json();
    cargoSelect.innerHTML = '<option value="">-- Selecione o cargo --</option>';
    cargos.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id_cargo;
      opt.textContent = `${c.id_cargo} - ${c.nome_cargo}`;
      cargoSelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    cargoSelect.innerHTML = '<option value="">(erro ao carregar cargos)</option>';
  }
}

async function carregarSugestoesCPFs() {
  // Puxa CPFs de /pessoa para preencher o datalist
  try {
    const res = await fetch(`${API_BASE_URL}/pessoa`);
    if (!res.ok) throw new Error();
    const pessoas = await res.json();
    cpfsList.innerHTML = '';
    pessoas.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.cpf_pessoa;
      cpfsList.appendChild(opt);
    });
  } catch {
    // silencioso — datalist não é crítico
  }
}

async function carregarListaCompleta() {
  // Carrega /pessoa, /cliente e /funcionario e monta uma view unificada
  try {
    const [pRes, cRes, fRes] = await Promise.all([
      fetch(`${API_BASE_URL}/pessoa`),
      fetch(`${API_BASE_URL}/cliente`),
      fetch(`${API_BASE_URL}/funcionario`)
    ]);
    if (!pRes.ok) throw new Error('Erro ao carregar pessoas');
    const pessoas = await pRes.json();
    const clientes = cRes.ok ? await cRes.json() : [];
    const funcionarios = fRes.ok ? await fRes.json() : [];

    // Map cpf -> objeto inicializado com dados de pessoa
    const mapa = new Map();
    pessoas.forEach(p => {
      mapa.set(p.cpf_pessoa, {
        cpf: p.cpf_pessoa,
        nome: p.nome_pessoa,
        data_nascimento: p.data_nascimento_pessoa,
        tipo: 'Pessoa',
        detalhe: ''
      });
    });

    // Sobrepõe clientes
    clientes.forEach(c => {
      const cpf = c.cpf_cliente;
      const base = mapa.get(cpf) || { cpf, nome: c.nome_pessoa || '', data_nascimento: c.data_nascimento_pessoa || '' };
      base.tipo = 'Cliente';
      base.detalhe = c.data_cadastro ? `Cadastro: ${formatDate(c.data_cadastro)}` : '';
      mapa.set(cpf, base);
    });

    // Sobrepõe funcionários
    funcionarios.forEach(f => {
      const cpf = f.cpf_pessoa;
      const base = mapa.get(cpf) || { cpf, nome: f.nome_pessoa || '', data_nascimento: f.data_nascimento_pessoa || '' };
      base.tipo = 'Funcionário';
      base.detalhe = f.nome_cargo ? `${f.nome_cargo} (salário: ${formatMoney(f.salario)})` : `cargo: ${f.id_cargo}`;
      mapa.set(cpf, base);
    });

    // Render tabela
    pessoasTableBody.innerHTML = '';
    Array.from(mapa.values()).forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><button class="link-btn" data-cpf="${p.cpf}">${p.cpf}</button></td>
        <td>${escapeHtml(p.nome || '')}</td>
        <td>${p.tipo || ''}</td>
        <td>${escapeHtml(p.detalhe || '')}</td>
        <td>${p.data_nascimento ? formatDate(p.data_nascimento) : ''}</td>
      `;
      pessoasTableBody.appendChild(tr);
    });

    // delegação: clique no botão CPF abre buscar
    document.querySelectorAll('.link-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cpf = e.currentTarget.getAttribute('data-cpf');
        searchId.value = cpf;
        buscarPessoa();
      });
    });

  } catch (err) {
    console.error(err);
    showMessage('Erro ao carregar lista completa', 'error');
  }
}

/* ---------- Buscar: funcionario -> cliente -> nova pessoa ---------- */
async function buscarPessoa() {
  const cpf = (searchId.value || '').trim();
  if (!cpf) {
    showMessage('Digite um CPF para buscar 💕');
    return;
  }
  if (cpf.length !== 11) {
    showMessage('CPF deve ter 11 dígitos.', 'error');
    return;
  }

  showMessage('Buscando...', 'info', 0);

  try {
    // 1) tenta funcionario
    let res = await fetch(`${API_BASE_URL}/funcionario/${cpf}`);
    if (res.ok) {
      const f = await res.json();
      preencherFormularioComFuncionario(f);
      showMessage('Funcionário encontrado ✨', 'success');
      return;
    }

    // 2) tenta cliente
    res = await fetch(`${API_BASE_URL}/cliente/${cpf}`);
    if (res.ok) {
      const c = await res.json();
      preencherFormularioComCliente(c);
      showMessage('Cliente encontrado ✨', 'success');
      return;
    }

    // 3) tenta apenas pessoa (caso pessoa exista sem papel)
    res = await fetch(`${API_BASE_URL}/pessoa/${cpf}`);
    if (res.ok) {
      const p = await res.json();
      preencherFormularioComPessoa(p);
      showMessage('Pessoa encontrada (sem tipo) ✨', 'success');
      return;
    }

    // 4) nova pessoa (nenhum registro)
    limparFormulario(false);
    searchId.value = cpf;
    showMessage('CPF não cadastrado — preencha os dados para criar.', 'info');
  } catch (err) {
    console.error(err);
    showMessage('Erro ao buscar CPF', 'error');
  }
}

function preencherFormularioComFuncionario(f) {
  currentCPF = f.cpf_pessoa;
  currentTipo = 'funcionario';

  searchId.value = f.cpf_pessoa;
  nomeInput.value = f.nome_pessoa || '';
  nascInput.value = f.data_nascimento_pessoa ? f.data_nascimento_pessoa.split('T')[0] : '';

  tipoSelect.value = 'funcionario';
  handleTipoChange();

  salarioInput.value = f.salario ?? '';
  // tenta selecionar o cargo pelo id
  if (f.id_cargo !== undefined && f.id_cargo !== null) {
    cargoSelect.value = f.id_cargo;
  } else if (f.nome_cargo) {
    // fallback: tenta encontrar por nome (se api de cargo retornar nome)
    Array.from(cargoSelect.options).forEach(o => {
      if (o.textContent.includes(f.nome_cargo)) cargoSelect.value = o.value;
    });
  }

  btnExcluir.style.display = 'inline-flex';
}

function preencherFormularioComCliente(c) {
  currentCPF = c.cpf_cliente;
  currentTipo = 'cliente';

  searchId.value = c.cpf_cliente;
  nomeInput.value = c.nome_pessoa || '';
  nascInput.value = c.data_nascimento_pessoa ? c.data_nascimento_pessoa.split('T')[0] : '';

  tipoSelect.value = 'cliente';
  handleTipoChange();

  dataCadastroInput.value = c.data_cadastro ? c.data_cadastro.split('T')[0] : '';

  btnExcluir.style.display = 'inline-flex';
}

function preencherFormularioComPessoa(p) {
  currentCPF = p.cpf_pessoa;
  currentTipo = null;

  searchId.value = p.cpf_pessoa;
  nomeInput.value = p.nome_pessoa || '';
  nascInput.value = p.data_nascimento_pessoa ? p.data_nascimento_pessoa.split('T')[0] : '';

  tipoSelect.value = '';
  handleTipoChange();

  btnExcluir.style.display = 'inline-flex';
}

/* ---------- Salvar lógica (criar Pessoa -> criar Cliente/Funcionario) ---------- */
async function salvarOperacao() {
  const cpf = (searchId.value || '').trim();
  const nome = (nomeInput.value || '').trim();
  const dataNasc = nascInput.value || '';

  if (!cpf || cpf.length !== 11) {
    showMessage('CPF inválido. Deve ter 11 dígitos.', 'error');
    return;
  }
  if (!nome) {
    showMessage('Preencha o nome.', 'error');
    return;
  }

  const tipo = tipoSelect.value; // 'cliente' | 'funcionario' | ''
  // 1) garante que Pessoa exista (criar se necessário)
  try {
    const pessoaExists = await verificarPessoaExiste(cpf);

    if (!pessoaExists) {
      // cria pessoa
      const res = await fetch(`${API_BASE_URL}/pessoa`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          cpf_pessoa: cpf,
          nome_pessoa: nome,
          data_nascimento_pessoa: dataNasc || null
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error: 'Erro criar pessoa'}));
        throw new Error(err.error || 'Falha ao criar pessoa');
      }
      showMessage('Pessoa criada ✅', 'success', 1000);
    } else {
      // tenta atualizar pessoa (não obrigatório, mas útil)
      await atualizarPessoaSeNecessario(cpf, nome, dataNasc);
    }

    // 2) cria/atualiza cliente ou funcionario conforme tipo
    if (tipo === 'cliente') {
      // montar payload e criar/atualizar cliente
      const payload = { cpf_cliente: cpf, data_cadastro: (dataCadastroInput.value || null) };
      // tenta atualizar
      let res = await fetch(`${API_BASE_URL}/cliente/${cpf}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ data_cadastro: payload.data_cadastro })
      });
      if (res.ok) {
        showMessage('Cliente atualizado ✅', 'success');
      } else {
        // tentar criar
        res = await fetch(`${API_BASE_URL}/cliente`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({error:'Erro salvar cliente'}));
          throw new Error(err.error || 'Falha salvar cliente');
        }
        showMessage('Cliente criado ✅', 'success');
      }
    } else if (tipo === 'funcionario') {
      // validar campos
      const salario = salarioInput.value ? Number(salarioInput.value) : null;
      const id_cargo = cargoSelect.value || null;
      if (salario === null || isNaN(salario) || id_cargo === null || id_cargo === '') {
        showMessage('Preencha salário e cargo para funcionário.', 'error');
        return;
      }

      // tenta atualizar
      let res = await fetch(`${API_BASE_URL}/funcionario/${cpf}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ salario, id_cargo })
      });
      if (res.ok) {
        showMessage('Funcionário atualizado ✅', 'success');
      } else {
        // tentar criar
        res = await fetch(`${API_BASE_URL}/funcionario`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ cpf_pessoa: cpf, salario, id_cargo })
        });
        if (!res.ok) {
          const err = await res.json().catch(()=>({ error: 'Erro salvar funcionário' }));
          throw new Error(err.error || 'Falha salvar funcionário');
        }
        showMessage('Funcionário criado ✅', 'success');
      }
    } else {
      showMessage('Pessoa salva (sem tipo específico).', 'success');
    }

    // recarrega listas e tabela
    await Promise.all([carregarSugestoesCPFs(), carregarListaCompleta()]);
    limparFormulario();
  } catch (err) {
    console.error(err);
    showMessage(err.message || 'Erro ao salvar', 'error');
  }
}

/* ---------- Excluir (tenta remover cliente/funcionario ou pessoa) ---------- */
async function excluirRegistro() {
  const cpf = (searchId.value || '').trim();
  if (!cpf || cpf.length !== 11) {
    showMessage('Digite um CPF válido para excluir.', 'error');
    return;
  }
  if (!confirm(`Deseja realmente excluir registros relacionados ao CPF ${cpf}?`)) return;

  try {
    // tenta excluir funcionario, cliente e pessoa (na ordem segura)
    // 1) funcionário
    await fetch(`${API_BASE_URL}/funcionario/${cpf}`, { method: 'DELETE' }).catch(()=>{});
    // 2) cliente
    await fetch(`${API_BASE_URL}/cliente/${cpf}`, { method: 'DELETE' }).catch(()=>{});
    // 3) pessoa
    await fetch(`${API_BASE_URL}/pessoa/${cpf}`, { method: 'DELETE' }).catch(()=>{});

    showMessage('Registros excluídos (se existiam).', 'success');
    await carregarSugestoesCPFs();
    await carregarListaCompleta();
    limparFormulario();
  } catch (err) {
    console.error(err);
    showMessage('Erro ao excluir', 'error');
  }
}

/* ---------- Utilitários (verificação/atualização pessoa) ---------- */
async function verificarPessoaExiste(cpf) {
  try {
    const res = await fetch(`${API_BASE_URL}/pessoa/${cpf}`);
    return res.ok;
  } catch {
    return false;
  }
}

async function atualizarPessoaSeNecessario(cpf, nome, dataNasc) {
  try {
    const res = await fetch(`${API_BASE_URL}/pessoa/${cpf}`);
    if (!res.ok) return;
    const p = await res.json();
    // se houver diferença, faz PUT
    const needUpdate =
      (p.nome_pessoa || '') !== (nome || '') ||
      ((p.data_nascimento_pessoa || '').split('T')[0] || '') !== (dataNasc || '');
    if (needUpdate) {
      await fetch(`${API_BASE_URL}/pessoa/${cpf}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          nome_pessoa: nome,
          data_nascimento_pessoa: dataNasc || null
        })
      });
    }
  } catch (err) {
    // silencioso
  }
}

/* ---------- Helpers ---------- */
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString.split('T')[0] || dateString;
  return d.toLocaleDateString('pt-BR');
}

function formatMoney(v) {
  if (v === undefined || v === null) return '';
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Limpar formulário ---------- */
function limparFormulario(clearSearch = true) {
  currentCPF = null;
  currentTipo = null;
  if (clearSearch) searchId.value = '';
  nomeInput.value = '';
  nascInput.value = '';
  tipoSelect.value = '';
  salarioInput.value = '';
  cargoSelect.value = '';
  dataCadastroInput.value = '';
  toggleConditionalFields();
  btnExcluir.style.display = 'none';
}

/* ---------- Tipo select handler ---------- */
function handleTipoChange() {
  toggleConditionalFields();
}

/* ---------- END ---------- */
