// =========================================================
// cadastro-pessoa.js - Código Completo
// Implementa CRUD e gerenciamento de estados com tema delicado.
// =========================================================

const API_BASE_URL = 'http://localhost:3000';

let currentCPF = null;      // CPF da pessoa atualmente carregada
let currentTipo = null;     // 'cliente' | 'funcionario' | null
let currentOperacao = null; // 'incluir' | 'alterar'

// --- Elementos do DOM ---
const searchId = document.getElementById('searchId');
const cpfsList = document.getElementById('cpfsList');

// Botões
const btnBuscar = document.getElementById('btnBuscar');
const btnLimpar = document.getElementById('btnLimpar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');

// Campos Comuns
const nomeInput = document.getElementById('nome_pessoa');
const nascInput = document.getElementById('data_nascimento_pessoa');
const tipoSelect = document.getElementById('tipo_pessoa');

// Campos de Funcionário
const funcionarioFields = document.getElementById('funcionarioFields');
const salarioInput = document.getElementById('salario');
const cargoSelect = document.getElementById('id_cargo');

// Campos de Cliente
const clienteFields = document.getElementById('clienteFields');
const dataCadastroInput = document.getElementById('data_cadastro');

// Listagem e Mensagens
const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');

// =================================================================
// FUNÇÕES DE CONTROLE DE ESTADO E UI (Interface)
// =================================================================

/**
 * Gerencia a visibilidade dos botões de ação (Novo padrão de tema).
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
 * Controla a visibilidade e habilitação dos campos condicionais (Cliente/Funcionário).
 */
const toggleFields = (tipo) => {
    const isFuncionario = tipo === 'funcionario';
    const isCliente = tipo === 'cliente';
    
    // Visibilidade dos fieldsets
    funcionarioFields.style.display = isFuncionario ? 'block' : 'none';
    clienteFields.style.display = isCliente ? 'block' : 'none';

    // Habilitação dos campos
    salarioInput.disabled = !isFuncionario || currentOperacao === null;
    cargoSelect.disabled = !isFuncionario || currentOperacao === null;
    dataCadastroInput.disabled = !isCliente || currentOperacao === null;
    
    // Se for 'incluir' ou 'alterar', habilita os campos específicos do tipo
    if (currentOperacao) {
        if (isFuncionario) {
             salarioInput.disabled = false;
             cargoSelect.disabled = false;
        } else if (isCliente) {
             dataCadastroInput.disabled = false;
        }
    }
};

/**
 * Lida com a mudança no tipo de pessoa e atualiza os campos visíveis.
 */
function handleTipoChange() {
    currentTipo = tipoSelect.value;
    toggleFields(currentTipo);
}

/**
 * Habilita ou desabilita os campos comuns para edição.
 */
function setFormState(isEditable) {
    nomeInput.disabled = !isEditable;
    nascInput.disabled = !isEditable;
    tipoSelect.disabled = !isEditable;
    searchId.disabled = isEditable; // Desabilita busca se estiver editando

    if (!isEditable) {
        currentOperacao = null;
        salarioInput.disabled = true;
        cargoSelect.disabled = true;
        dataCadastroInput.disabled = true;
        gerenciarBotoes({}); // Limpa todos os botões
    }
}

/**
 * Reseta o formulário para o estado inicial de busca.
 */
function limparFormulario(clearSearch = true) {
    currentCPF = null;
    currentTipo = null;
    currentOperacao = null;
    
    // Limpa campos
    if (clearSearch) searchId.value = '';
    nomeInput.value = '';
    nascInput.value = '';
    tipoSelect.value = '';
    salarioInput.value = '';
    dataCadastroInput.value = '';
    
    // Oculta campos condicionais
    funcionarioFields.style.display = 'none';
    clienteFields.style.display = 'none';
    
    // Configura estado inicial (somente busca habilitada)
    setFormState(false);
    searchId.disabled = false;
    searchId.focus();
    
    // Recarrega a lista
    loadPessoas();
}

/**
 * Prepara o formulário para a inclusão de um novo registro.
 */
function prepararInclusao() {
    if (!currentCPF) {
        mostrarMensagem('O CPF precisa ser preenchido para inclusão.');
        return;
    }
    limparFormulario(false); // Mantém o CPF
    currentOperacao = 'incluir';
    setFormState(true);
    nomeInput.focus();
    gerenciarBotoes({ salvar: true });
    mostrarMensagem('Modo Inclusão: Preencha os dados e salve.');
}

/**
 * Prepara o formulário para a alteração de um registro existente.
 */
function prepararAlteracao() {
    if (!currentCPF) {
        mostrarMensagem('Busque uma pessoa primeiro para alterar.');
        return;
    }
    currentOperacao = 'alterar';
    setFormState(true);
    nomeInput.focus();
    gerenciarBotoes({ salvar: true, excluir: true });
    toggleFields(currentTipo); // Garante que os campos atuais estejam visíveis e habilitados
    mostrarMensagem('Modo Alteração: Edite e clique em Salvar.');
}


// =================================================================
// FUNÇÕES DE COMUNICAÇÃO COM A API (CRUD)
// =================================================================

/**
 * Carrega a lista de cargos da API para o <select> de cargo.
 */
async function loadCargos() {
    try {
        const res = await fetch(`${API_BASE_URL}/cargo`);
        if (!res.ok) throw new Error('Falha ao carregar cargos.');
        const cargos = await res.json();
        
        cargoSelect.innerHTML = '<option value="">Selecione o Cargo</option>';
        cargos.forEach(cargo => {
            const option = document.createElement('option');
            option.value = cargo.id_cargo;
            option.textContent = cargo.nome_cargo;
            cargoSelect.appendChild(option);
        });
    } catch (err) {
        mostrarMensagem('Erro ao carregar cargos: ' + err.message);
    }
}

/**
 * Carrega CPFs existentes para a lista de sugestões (datalist).
 */
async function loadCpfs() {
    try {
        const res = await fetch(`${API_BASE_URL}/pessoa`);
        if (!res.ok) throw new Error('Falha ao carregar lista de CPFs.');
        const pessoas = await res.json();
        
        cpfsList.innerHTML = '';
        pessoas.forEach(p => {
            const option = document.createElement('option');
            option.value = p.cpf_pessoa;
            cpfsList.appendChild(option);
        });
    } catch (err) {
        // Silencioso, pois é uma função de UX
    }
}

/**
 * Busca uma pessoa na API pelo CPF.
 */
async function buscarPessoa() {
    const cpf = searchId.value.replace(/\D/g, '');
    if (cpf.length !== 11) {
        mostrarMensagem('O CPF deve ter 11 dígitos.');
        limparFormulario();
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/pessoa/${cpf}`);
        
        if (res.ok) {
            const pessoa = await res.json();
            currentCPF = cpf;
            currentTipo = pessoa.tipo_pessoa;
            
            // Popula campos comuns
            nomeInput.value = pessoa.nome_pessoa;
            nascInput.value = pessoa.data_nascimento_pessoa ? pessoa.data_nascimento_pessoa.split('T')[0] : '';
            tipoSelect.value = pessoa.tipo_pessoa;
            
            // Exibe e popula campos condicionais
            toggleFields(currentTipo); 
            
            if (currentTipo === 'funcionario') {
                const funcRes = await fetch(`${API_BASE_URL}/funcionario/${cpf}`);
                if (funcRes.ok) {
                    const funcionario = await funcRes.json();
                    salarioInput.value = funcionario.salario;
                    cargoSelect.value = funcionario.id_cargo;
                }
            } else if (currentTipo === 'cliente') {
                const cliRes = await fetch(`${API_BASE_URL}/cliente/${cpf}`);
                if (cliRes.ok) {
                    const cliente = await cliRes.json();
                    dataCadastroInput.value = cliente.data_cadastro ? cliente.data_cadastro.split('T')[0] : '';
                }
            }
            
            // Estado de registro existente
            setFormState(false);
            gerenciarBotoes({ alterar: true, excluir: true });
            mostrarMensagem(`Pessoa (CPF ${cpf}) encontrada! Tipo: ${currentTipo}.`);
        } else if (res.status === 404) {
            // Não encontrado, prepara para inclusão
            currentCPF = cpf;
            prepararInclusao();
            mostrarMensagem('CPF não encontrado. Preencha os dados para incluir.');
        } else {
            throw new Error('Erro ao buscar pessoa.');
        }
    } catch (err) {
        mostrarMensagem(err.message || 'Erro de comunicação com o servidor.');
        limparFormulario();
    }
}


/**
 * Salva (inclui ou altera) o registro da pessoa e seus dados específicos.
 */
async function salvarPessoa() {
    if (currentOperacao !== 'incluir' && currentOperacao !== 'alterar') return;

    const cpf = currentCPF;
    const nome = nomeInput.value.trim();
    const dataNasc = nascInput.value;
    const tipo = tipoSelect.value;
    
    // Validação básica
    if (!nome || !tipo) {
        mostrarMensagem('Nome e Tipo de Pessoa são obrigatórios.');
        return;
    }
    if (tipo === 'funcionario' && (!salarioInput.value || !cargoSelect.value)) {
        mostrarMensagem('Para funcionário, Salário e Cargo são obrigatórios.');
        return;
    }

    const isNew = currentOperacao === 'incluir';
    let msgSuccess = isNew ? 'Pessoa incluída com sucesso!' : 'Pessoa alterada com sucesso!';
    
    try {
        // 1. CRUD na tabela Pessoa
        const pessoaData = {
            cpf_pessoa: cpf,
            nome_pessoa: nome,
            data_nascimento_pessoa: dataNasc,
            tipo_pessoa: tipo
        };
        
        await fetch(`${API_BASE_URL}/pessoa`, {
            method: isNew ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pessoaData)
        });

        // 2. CRUD na tabela específica (Cliente/Funcionário)
        if (tipo === 'funcionario') {
            const funcionarioData = {
                cpf_funcionario: cpf,
                salario: parseFloat(salarioInput.value),
                id_cargo: parseInt(cargoSelect.value)
            };
            
            // Tenta ALTERAR, se falhar (404), tenta INCLUIR
            let funcMethod = 'PUT';
            let funcUrl = `${API_BASE_URL}/funcionario/${cpf}`;

            let res = await fetch(funcUrl, {
                method: funcMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcionarioData)
            });

            if (!res.ok && res.status === 404) {
                 funcMethod = 'POST';
                 funcUrl = `${API_BASE_URL}/funcionario`;
                 await fetch(funcUrl, {
                    method: funcMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(funcionarioData)
                });
            }
            
        } else if (tipo === 'cliente') {
            const clienteData = {
                cpf_cliente: cpf,
                data_cadastro: dataCadastroInput.value
            };
            
            // Tenta ALTERAR, se falhar (404), tenta INCLUIR
            let cliMethod = 'PUT';
            let cliUrl = `${API_BASE_URL}/cliente/${cpf}`;
            
            let res = await fetch(cliUrl, {
                method: cliMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });

            if (!res.ok && res.status === 404) {
                 cliMethod = 'POST';
                 cliUrl = `${API_BASE_URL}/cliente`;
                 await fetch(cliUrl, {
                    method: cliMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clienteData)
                });
            }
        }
        
        mostrarMensagem(msgSuccess);
        limparFormulario();
        loadCpfs(); // Atualiza a lista de sugestões
    } catch (error) {
        mostrarMensagem(`Erro ao salvar: ${error.message}`);
    }
}


/**
 * Exclui a pessoa (e seus registros relacionados) pelo CPF.
 */
async function excluirPessoa() {
    if (!currentCPF) {
        mostrarMensagem('Nenhuma pessoa carregada para exclusão.');
        return;
    }

    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE a pessoa com CPF ${currentCPF}?`)) {
        return;
    }

    try {
        // A API deve ter a lógica para excluir registros dependentes (Cliente/Funcionário)
        const res = await fetch(`${API_BASE_URL}/pessoa/${currentCPF}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error('Falha ao excluir o registro principal da pessoa.');
        }

        mostrarMensagem('Pessoa excluída com sucesso!');
        limparFormulario();
        loadCpfs(); // Atualiza a lista de sugestões
    } catch (err) {
        mostrarMensagem(err.message || 'Erro ao tentar excluir a pessoa.');
    }
}


/**
 * Carrega a lista de pessoas para a tabela.
 */
async function loadPessoas() {
    try {
        const res = await fetch(`${API_BASE_URL}/pessoa/completo`); // Endpoint para dados completos
        if (!res.ok) throw new Error('Falha ao carregar lista de pessoas.');
        const pessoas = await res.json();
        
        pessoasTableBody.innerHTML = '';
        
        pessoas.forEach(p => {
            const row = document.createElement('tr');
            
            // Define o detalhe (Salário ou Data de Cadastro)
            let detalhe = '';
            if (p.tipo_pessoa === 'funcionario' && p.salario) {
                detalhe = `Salário: ${formatMoney(p.salario)}`;
            } else if (p.tipo_pessoa === 'cliente' && p.data_cadastro) {
                detalhe = `Cadastro: ${formatDate(p.data_cadastro)}`;
            } else if (p.tipo_pessoa === 'funcionario' && p.nome_cargo) {
                detalhe = `Cargo: ${p.nome_cargo}`; // Exibe o cargo se o salário não estiver disponível
            }

            row.innerHTML = `
                <td>${escapeHtml(p.cpf_pessoa)}</td>
                <td>${escapeHtml(p.nome_pessoa)}</td>
                <td>${escapeHtml(p.tipo_pessoa)}</td>
                <td>${detalhe}</td>
                <td>${formatDate(p.data_nascimento_pessoa)}</td>
            `;
            row.onclick = () => {
                searchId.value = p.cpf_pessoa;
                buscarPessoa();
            };
            pessoasTableBody.appendChild(row);
        });
    } catch (err) {
        mostrarMensagem('Erro ao carregar lista de pessoas: ' + err.message, 5000);
    }
}


// =================================================================
// FUNÇÕES AUXILIARES E INICIALIZAÇÃO
// =================================================================

/**
 * Função debounce para limitar a frequência de chamadas (ex: no input do CPF).
 */
function debounce(fn, wait) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

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
    const EMOJIS = ['💖', '💕', '🌸', '💓', '💞', '✨', '💖', '💕', '🌸', '💓', '💞']; 
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
    btnBuscar.addEventListener('click', buscarPessoa);
    btnLimpar.addEventListener('click', limparFormulario);
    btnIncluir.addEventListener('click', prepararInclusao);
    btnAlterar.addEventListener('click', prepararAlteracao);
    btnExcluir.addEventListener('click', excluirPessoa);
    btnSalvar.addEventListener('click', salvarPessoa);
    
    tipoSelect.addEventListener('change', handleTipoChange);
    
    // Atualiza a datalist a cada 300ms enquanto o usuário digita
    searchId.addEventListener('input', debounce(loadCpfs, 300));
    searchId.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarPessoa();
        }
    });
}

/**
 * Função de inicialização principal.
 */
async function inicializar() {
    await loadCargos();
    await loadCpfs();
    await loadPessoas();
    limparFormulario(); // Define o estado inicial após carregar os dados
    createFloatingHearts();
}

// Inicia a aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializar);