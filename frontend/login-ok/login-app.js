// login-app.js — integração UI com auth.js (módulo)

import { login as authLogin, registrar as authRegistrar, mostrarMensagem } from './auth.js';

// **NOTA:** Remoção de GERENTE_EMAIL e GERENTE_SENHA, a checagem é feita pelo backend.

// Utils de nextPath (quando outra página pede login antes de prosseguir)
function setNextPath(path) { localStorage.setItem('nextPathAfterAuth', path); }
function getNextPath() { return localStorage.getItem('nextPathAfterAuth'); }
function clearNextPath() { localStorage.removeItem('nextPathAfterAuth'); }

document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const btnLoginTab = document.getElementById('btn-login');
  const btnCadastroTab = document.getElementById('btn-cadastrar');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');

  btnLoginTab.addEventListener('click', () => {
    btnLoginTab.classList.add('active'); btnCadastroTab.classList.remove('active');
    formLogin.classList.remove('hidden'); formCadastro.classList.add('hidden');
    btnLoginTab.setAttribute('aria-selected','true'); btnCadastroTab.setAttribute('aria-selected','false');
    mostrarMensagem(document.getElementById('login-message'), '', 'limpar');
  });
  btnCadastroTab.addEventListener('click', () => {
    btnCadastroTab.classList.add('active'); btnLoginTab.classList.remove('active');
    formCadastro.classList.remove('hidden'); formLogin.classList.add('hidden');
    btnCadastroTab.setAttribute('aria-selected','true'); btnLoginTab.setAttribute('aria-selected','false');
    mostrarMensagem(document.getElementById('login-message'), '', 'limpar');
  });

  // Form handlers
  formLogin.addEventListener('submit', handleLoginSubmit);
  formCadastro.addEventListener('submit', handleCadastroSubmit);
});

// Função unificada para decidir o redirecionamento baseado no role
function checkAndRedirect(usuario) {
  const role = (usuario.role || '').toLowerCase();
  
  if (role === 'gerente') {
    // Se for gerente, mostra o modal de gerente
    setTimeout(() => showGerenteModal(), 600);
  } else if (role === 'cliente' || role === 'funcionário') {
    // Para clientes e outros funcionários, mostra o recado padrão
    setTimeout(() => showRecado(usuario), 600);
  } else {
    // Caso padrão, redireciona para o menu principal
    const next = getNextPath();
    clearNextPath();
    if (next) window.location.href = next;
    else window.location.href = '../menu.html';
  }
}

// Mostrar recado pós-login (overlay com opções)
function showRecado(usuario) {
  // ... (código showRecado inalterado, pois ele apenas mostra o pop-up e redireciona) ...
  const overlay = document.createElement('div');
  overlay.className = 'recado-overlay';

  const box = document.createElement('div');
  box.className = 'recado-box';
  
  // Usa o nome_pessoa retornado pelo backend
  const nomeUsuario = usuario.nome_pessoa || usuario.user?.nome_pessoa || 'amigo(a)';
  box.innerHTML = `
    <div class="recado-icon">💗</div>
    <h2>Olá, ${nomeUsuario.split(' ')[0]}!</h2>
    <p>Seu login foi realizado com sucesso. O que deseja fazer agora?</p>
    <div class="recado-botoes">
      <button id="btn-continuar-comprando">Continuar comprando</button>
      <button id="btn-finalizar-compra">Finalizar pedido</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(box);

  document.getElementById('btn-continuar-comprando').addEventListener('click', () => {
    overlay.remove(); box.remove();
    // redireciona para nextPath se existir, senão para menu
    const next = getNextPath();
    clearNextPath();
    if (next) window.location.href = next;
    else window.location.href = '../menu/menu.html'; // Ajuste o path para a sua pasta menu
  });

  document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
    overlay.remove(); box.remove();
    const next = getNextPath();
    clearNextPath();
    if (next) window.location.href = next;
    else window.location.href = '../pagamento/final.html'; // Ajuste o path para a sua pasta pagamento
  });
}

// Modal do gerente (se aplicável)
function showGerenteModal() {
  const overlay = document.createElement('div');
  overlay.className = 'manager-overlay';
  const box = document.createElement('div');
  box.className = 'manager-box';
  box.innerHTML = `
    <h3>Olá, Gerente</h3>
    <p>Deseja voltar para a tela inicial ou continuar na área administrativa?</p>
    <div class="manager-actions">
      <button id="mgr-voltar" class="btn-popup">Voltar à Home</button>
      <button id="mgr-continuar" class="btn-popup">Continuar</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(box);

  document.getElementById('mgr-voltar').addEventListener('click', () => {
    clearNextPath();
    window.location.href = '../index.html'; // Assumindo index.html é a home
  });
  document.getElementById('mgr-continuar').addEventListener('click', () => {
    overlay.remove(); box.remove();
    const next = getNextPath();
    clearNextPath();
    // Redireciona para o Gerenciamento principal
    if (next) window.location.href = next;
    else window.location.href = '../gerenciamento/gerenciamento.html'; // Ajuste o path
  });
}

// Handle login submit
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = (document.getElementById('email-login').value || '').trim();
  const senha = (document.getElementById('senha-login').value || '').toString();
  const btn = document.getElementById('btn-login-submit');

  if (!email || !senha) {
    mostrarMensagem(document.getElementById('login-message'), 'Preencha e-mail e senha', 'erro');
    return;
  }

  const originalText = btn.textContent;
  btn.textContent = 'Entrando...'; btn.disabled = true;

  try {
    const data = await authLogin(email, senha); 
    if (data && data.auth) {
      // data.user contém { nome_pessoa, email_pessoa, role: 'Gerente'/'Cliente', ...}
      mostrarMensagem(document.getElementById('login-message'), 'Login realizado com sucesso!', 'sucesso');
      
      // Chamada à função unificada de redirecionamento
      checkAndRedirect(data.user);

    } else {
      mostrarMensagem(document.getElementById('login-message'), data.message || data.error || 'Email ou senha incorretos', 'erro');
    }
  } catch (err) {
    console.error('Erro no login:', err);
    mostrarMensagem(document.getElementById('login-message'), 'Erro na conexão com o servidor', 'erro');
  } finally {
    btn.textContent = originalText; btn.disabled = false;
  }
}

// Handle cadastro submit (MODIFICADO)
async function handleCadastroSubmit(e) {
  e.preventDefault();
  // 1. Capturar TODOS os campos necessários
  const cpf = (document.getElementById('cpf-cadastro').value || '').trim().replace(/\D/g, ''); // Limpa e pega apenas dígitos
  const nome = (document.getElementById('nome-cadastro').value || '').trim();
  const dataNascimento = (document.getElementById('data-nascimento-cadastro').value || '').trim(); // Formato YYYY-MM-DD
  const email = (document.getElementById('email-cadastro').value || '').trim();
  const senha = (document.getElementById('senha-cadastro').value || '').toString();
  const confirmar = (document.getElementById('confirmar-senha').value || '').toString();
  const btn = document.getElementById('btn-submit-cadastro');

  // 2. Validação local
  if (!cpf || !nome || !dataNascimento || !email || !senha) {
    mostrarMensagem(document.getElementById('login-message'), 'Preencha todos os campos obrigatórios do cadastro', 'erro');
    return;
  }
  if (cpf.length !== 11) {
    mostrarMensagem(document.getElementById('login-message'), 'O CPF deve ter 11 dígitos numéricos', 'erro');
    return;
  }
  if (senha.length < 6 || senha.length > 20) {
    mostrarMensagem(document.getElementById('login-message'), 'Senha deve ter entre 6 e 20 caracteres', 'erro');
    return;
  }
  if (senha !== confirmar) {
    mostrarMensagem(document.getElementById('login-message'), 'As senhas não coincidem', 'erro');
    return;
  }

  const originalText = btn.textContent;
  btn.textContent = 'Cadastrando...'; btn.disabled = true;

  try {
    // 3. Montar Payload com nomes de colunas do BD
    const payload = { 
        cpf_pessoa: cpf,
        nome_pessoa: nome, 
        data_nascimento_pessoa: dataNascimento,
        email_pessoa: email, 
        senha_pessoa: senha 
    };
    
    const data = await authRegistrar(payload); 
    
    if (data && data.role === 'Cliente') { // Verifica se o cadastro (e criação do cliente) foi OK
      mostrarMensagem(document.getElementById('login-message'), 'Cadastro realizado com sucesso!', 'sucesso');
      
      // Chamada à função unificada de redirecionamento. data já tem a role='Cliente'
      checkAndRedirect(data);

    } else {
      mostrarMensagem(document.getElementById('login-message'), data.error || data.message || 'Erro no cadastro. Tente novamente.', 'erro');
    }
  } catch (err) {
    console.error('Erro no cadastro:', err);
    mostrarMensagem(document.getElementById('login-message'), 'Erro na conexão com o servidor', 'erro');
  } finally {
    btn.textContent = originalText; btn.disabled = false;
  }
}

// Função pública que outras páginas podem chamar para garantir login antes de prosseguir
export function ensureLoggedAndProceed(nextPath) {
  // Se existe userId em sessionStorage, considera logado
  const userId = sessionStorage.getItem('userId') || localStorage.getItem('usuario');
  if (userId) {
    window.location.href = nextPath;
  } else {
    setNextPath(nextPath);
    // redireciona para a página de login atual
    window.location.href = '../login-ok/login.html' || window.location.href; // Ajustado o path para login-ok/login.html
  }
}

// Expor para window se necessário
window.ensureLoggedAndProceed = ensureLoggedAndProceed;