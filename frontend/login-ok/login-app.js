// login-app.js — integração UI com auth.js (módulo)
// Path: ../js/login-app.js (importa ./auth.js que deve estar no mesmo diretório)

import { login as authLogin, registrar as authRegistrar, mostrarMensagem } from './auth.js';

// Config: gerente (se quiser manter a checagem de gerente local)
const GERENTE_EMAIL = 'gerenteoksane@gemail.com';
const GERENTE_SENHA = '123';

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
  });
  btnCadastroTab.addEventListener('click', () => {
    btnCadastroTab.classList.add('active'); btnLoginTab.classList.remove('active');
    formCadastro.classList.remove('hidden'); formLogin.classList.add('hidden');
    btnCadastroTab.setAttribute('aria-selected','true'); btnLoginTab.setAttribute('aria-selected','false');
  });

  // Form handlers
  formLogin.addEventListener('submit', handleLoginSubmit);
  formCadastro.addEventListener('submit', handleCadastroSubmit);
});

// Mostrar recado pós-login (overlay com opções)
function showRecado(usuario) {
  const overlay = document.createElement('div');
  overlay.className = 'recado-overlay';

  const box = document.createElement('div');
  box.className = 'recado-box';
  box.innerHTML = `
    <div class="recado-icon">💗</div>
    <h2>Olá, ${usuario.nome || usuario.user?.nome || 'amigo(a)'}!</h2>
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
    else window.location.href = '../menu.html';
  });

  document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
    overlay.remove(); box.remove();
    const next = getNextPath();
    clearNextPath();
    if (next) window.location.href = next;
    else window.location.href = '../finalizacao/finalizacao.html'; // ajuste conforme sua rota
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
    window.location.href = '../index.html';
  });
  document.getElementById('mgr-continuar').addEventListener('click', () => {
    overlay.remove(); box.remove();
    const next = getNextPath();
    clearNextPath();
    if (next) window.location.href = next;
    else window.location.href = '../menu.html';
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
    const data = await authLogin(email, senha); // importa auth.js login()
    if (data && data.logged) {
      // auth.js já salva sessão no sessionStorage
      // data.user pode estar em data.user ou data.usuario
      const usuario = data.user || data.usuario || { nome: sessionStorage.getItem('userName') || email, email };
      mostrarMensagem(document.getElementById('login-message'), 'Login realizado com sucesso!', 'sucesso');

      // Se for gerente (cheque simples)
      const userCargo = sessionStorage.getItem('userCargo') || (usuario.cargo || '');
      if (email === GERENTE_EMAIL && senha === GERENTE_SENHA || userCargo.toLowerCase() === 'gerente') {
        // Mostrar modal gerente
        setTimeout(() => showGerenteModal(), 600);
      } else {
        // Mostrar recado pós-login
        setTimeout(() => showRecado(usuario), 600);
      }
    } else {
      mostrarMensagem(document.getElementById('login-message'), data.error || 'Email ou senha incorretos', 'erro');
    }
  } catch (err) {
    console.error('Erro no login:', err);
    mostrarMensagem(document.getElementById('login-message'), 'Erro na conexão com o servidor', 'erro');
  } finally {
    btn.textContent = originalText; btn.disabled = false;
  }
}

// Handle cadastro submit
async function handleCadastroSubmit(e) {
  e.preventDefault();
  const nome = (document.getElementById('nome-cadastro').value || '').trim();
  const email = (document.getElementById('email-cadastro').value || '').trim();
  const senha = (document.getElementById('senha-cadastro').value || '').toString();
  const confirmar = (document.getElementById('confirmar-senha').value || '').toString();
  const btn = document.getElementById('btn-submit-cadastro');

  if (!nome || !email || !senha) {
    mostrarMensagem(document.getElementById('login-message'), 'Preencha todos os campos do cadastro', 'erro');
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
    const payload = { name: nome, email, password: senha };
    const data = await authRegistrar(payload); // importa auth.js registrar()
    // auth.js registrar retorna o próprio objeto do backend (ver auth.js)
    if (data && (data.logged || data.user)) {
      mostrarMensagem(document.getElementById('login-message'), 'Cadastro realizado com sucesso!', 'sucesso');
      // Mostrar recado pós-cadastro (usa data.user ou payload)
      const usuario = data.user || { nome, email };
      // Caso gerente especial
      if (email === GERENTE_EMAIL && senha === GERENTE_SENHA) {
        setTimeout(() => showGerenteModal(), 600);
      } else {
        setTimeout(() => showRecado(usuario), 600);
      }
    } else {
      // Pode retornar objeto com error/message
      mostrarMensagem(document.getElementById('login-message'), data.error || data.message || 'Erro no cadastro', 'erro');
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
    window.location.href = '../html/login.html' || window.location.href;
  }
}

// Expor para window se necessário
window.ensureLoggedAndProceed = ensureLoggedAndProceed;