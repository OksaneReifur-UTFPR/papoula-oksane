// auth.js
// Responsável por: login, cadastro, manter user no localStorage, redirecionar ao pagamento
// e mostrar modal especial do gerente quando aplicável.

// CONFIG:
// Se seu backend estiver em outro host, ajuste API_BASE (ex: 'http://localhost:3000')
const API_BASE = ''; // '' = mesmo host
const ENDPOINT_LOGIN_VERIFY = API_BASE + '/login/verificarSenha';
const ENDPOINT_REGISTER = API_BASE + '/login'; // rota POST cria pessoa

// Credenciais de gerente solicitadas por você:
// (especificação enviada: gerenteoksane@gemail.com / senha 123)
const GERENTE_EMAIL = 'gerenteoksane@gemail.com';
const GERENTE_SENHA = '123';

// Função pública que outras páginas (ex: carrinho) podem chamar:
// ensureLoggedAndProceed('/frontend/html/pagamento.html')
// Se o usuário não estiver logado, será redirecionado para a tela de login/cadastro.
// Após login/cadastro bem-sucedido, será redirecionado para nextPath.
// Se já estiver logado, redireciona diretamente.
function ensureLoggedAndProceed(nextPath) {
  const usuario = getStoredUser();
  if (usuario && usuario.email) {
    window.location.href = nextPath;
  } else {
    // guarda onde o usuário deve voltar depois do login/cadastro
    localStorage.setItem('nextPathAfterAuth', nextPath);
    // ajusta o caminho para sua página de login/cadastro
    window.location.href = '/frontend/html/cadastro.html';
  }
}
// Exporta para window para poder ser usado globalmente
window.ensureLoggedAndProceed = ensureLoggedAndProceed;

// Utilitários de storage
function storeUser(userObj) {
  localStorage.setItem('usuario', JSON.stringify(userObj));
}
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('usuario') || 'null');
  } catch { return null; }
}
function clearNextPath() {
  localStorage.removeItem('nextPathAfterAuth');
}
function getNextPath() {
  return localStorage.getItem('nextPathAfterAuth');
}

// DOM
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');

  if (formLogin) formLogin.addEventListener('submit', handleLoginSubmit);
  if (formCadastro) formCadastro.addEventListener('submit', handleCadastroSubmit);
});

// LOGIN: envia email+senha para /login/verificarSenha
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = (document.getElementById('email-login').value || '').trim();
  const senha = (document.getElementById('senha-login').value || '').toString();

  if (!email || !senha) { alert('Preencha e-mail e senha.'); return; }

  try {
    const res = await fetch(ENDPOINT_LOGIN_VERIFY, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, senha })
    });

    if (!res.ok) {
      // Se o backend retornar 401 ou outro erro, informa ao usuário
      const txt = await res.text();
      throw new Error(txt || 'Credenciais inválidas');
    }

    const json = await res.json();
    // resposta do controller verificarSenha: { auth: true, token, user: { id, nome, email } }
    // Armazena o token/usuario para manter sessão
    storeUser(json);

    // Se for gerente conforme especificado, mostrar modal especial
    if (email === GERENTE_EMAIL && senha === GERENTE_SENHA) {
      showGerenteModal();
    } else {
      redirectAfterAuth();
    }
  } catch (err) {
    console.error('Erro no login:', err);
    alert('Erro ao autenticar: ' + (err.message || err));
  }
}

// CADASTRO: cria pessoa no banco e já loga na aplicação (salva no localStorage)
async function handleCadastroSubmit(e) {
  e.preventDefault();
  const nome = (document.getElementById('nome-cadastro').value || '').trim();
  const email = (document.getElementById('email-cadastro').value || '').trim();
  const senha = (document.getElementById('senha-cadastro').value || '').toString();
  const confirmar = (document.getElementById('confirmar-senha').value || '').toString();

  if (!nome || !email || !senha) { alert('Preencha nome, e-mail e senha.'); return; }
  if (senha !== confirmar) { alert('As senhas não coincidem.'); return; }

  try {
    const res = await fetch(ENDPOINT_REGISTER, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nome, email, senha })
    });

    if (!res.ok) {
      // Possível 409 (email já cadastrado) ou outro erro
      const txt = await res.text();
      throw new Error(txt || `Erro ao cadastrar (status ${res.status})`);
    }

    const created = await res.json(); // { id_pessoa, nome, email } conforme controller
    // Criamos um objeto de sessão similar ao do login: você pode adaptar para incluir token mais tarde
    const sessionPayload = { auth: true, user: { id: created.id_pessoa || created.id, nome: created.nome, email: created.email } };
    storeUser(sessionPayload);

    // Se o usuário se cadastrou como gerente especial, exibir modal
    if (email === GERENTE_EMAIL && senha === GERENTE_SENHA) {
      showGerenteModal();
    } else {
      redirectAfterAuth();
    }
  } catch (err) {
    console.error('Erro no cadastro:', err);
    alert('Erro ao cadastrar: ' + (err.message || err));
  }
}

// Redireciona para o destino salvo (se houver) ou para a página de pagamento/índice
function redirectAfterAuth() {
  const next = getNextPath();
  clearNextPath();
  if (next) {
    window.location.href = next;
  } else {
    // padrão: redireciona para pagamento (você pode alterar)
    window.location.href = '/frontend/html/pagamento.html';
  }
}

// Modal especial para gerente (pequena tela retangular com as mesmas classes visuais)
function showGerenteModal() {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'manager-overlay';

  // Box
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
    // limpar next e redirecionar para home
    clearNextPath();
    window.location.href = '/frontend/html/index.html';
  });

  document.getElementById('mgr-continuar').addEventListener('click', () => {
    // simplesmente remove o modal e continua o fluxo (redireciona se houver next)
    overlay.remove();
    box.remove();
    redirectAfterAuth();
  });
}

// Expor algumas funções úteis para debug e integração
window.auth = {
  ensureLoggedAndProceed,
  getStoredUser,
  storeUser
};