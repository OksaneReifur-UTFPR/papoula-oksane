// INÍCIO DO SEU ARQUIVO (ex: cadastro.js)

// =================================================================
// COLE AS DUAS FUNÇÕES PRINCIPAIS AQUI, NO TOPO DO ARQUIVO
// =================================================================

// Função principal que é chamada quando o usuário clica no botão "Entrar"
async function handleLogin(event) {
    // Previne o recarregamento da página (comportamento padrão de um formulário)
    event.preventDefault(); 

    // 1. Pegue os valores dos campos de email e senha do seu formulário HTML
    //    !!! IMPORTANTE: Troque 'id-do-seu-email' e 'id-da-sua-senha' pelos IDs reais !!!
    const email = document.getElementById('id-do-seu-email').value;
    const senha = document.getElementById('id-da-sua-senha').value;

    // 2. Defina os dados do gerente
    const gerenteEmail = 'gerente.oksane@gmail.com';
    const gerenteSenha = 'gleswz23';

    let usuarioLogado = null;

    // 3. Verifique se é o gerente
    if (email === gerenteEmail && senha === gerenteSenha) {
        usuarioLogado = { email: gerenteEmail, tipo: 'gerente' };
        console.log('Login como GERENTE bem-sucedido!');
    } else {
        // Simulação de login de cliente
        console.log('Tentativa de login como CLIENTE.');
        usuarioLogado = { email: email, tipo: 'cliente' };
    }

    // 4. Se o login foi bem-sucedido
    if (usuarioLogado) {
        localStorage.setItem('usuario', JSON.stringify(usuarioLogado));
        mostrarRecadoPosLogin(); // Chama a função para mostrar a mensagem
    } else {
        alert('Email ou senha inválidos.');
    }
}

// Função para mostrar o "recadinho carinhoso"
function mostrarRecadoPosLogin() {
    // Cria o fundo escurecido
    const overlay = document.createElement('div');
    overlay.className = 'recado-overlay';

    // Cria a caixa da mensagem
    const recadoBox = document.createElement('div');
    recadoBox.className = 'recado-box';

    // Adiciona o conteúdo
    recadoBox.innerHTML = `
        <div class="recado-icon">🌸</div>
        <h2>Login realizado com sucesso!</h2>
        <p>O que você gostaria de fazer agora, flor?</p>
        <div class="recado-botoes">
            <button id="btn-continuar-comprando">Continuar Comprando</button>
            <button id="btn-finalizar-compra">Finalizar Compra</button>
        </div>
    `;

    // Adiciona à página
    document.body.appendChild(overlay);
    document.body.appendChild(recadoBox);

    // Adiciona os eventos aos botões
    document.getElementById('btn-continuar-comprando').addEventListener('click', () => {
        window.location.href = '/frontend/html/produtos.html'; 
    });

    document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
        window.location.href = '/frontend/html/pagamento.html';
    });
}

// =================================================================
// FIM DO BLOCO DE CÓDIGO A SER COLADO
// =================================================================


// ... O resto do seu código JavaScript original pode continuar aqui ...
// (funções de validação de formulário, etc.)


/**
 * Exibe um popup de boas-vindas após o login bem-sucedido.
 * Oferece opções para continuar comprando ou ir para o carrinho/finalizar a compra.
 * @param {object} usuario - O objeto do usuário retornado pela API, contendo `nome` e `tipo`.
 */
function mostrarPopupLogin(usuario) {
  const msgDiv = document.getElementById('login-message');
  // Reutiliza o estilo do popup do carrinho para manter a consistência visual
  msgDiv.className = 'cart-message';
  msgDiv.innerHTML = `
    <span class="heart">💖</span>
    Olá, <b>${usuario.nome || 'cliente'}</b>! Que bom te ver por aqui.  

    O que deseja fazer?
    <div class="popup-buttons">
      <button class="btn-popup" id="btn-continuar">Continuar comprando</button>
      <button class="btn-popup" id="btn-finalizar">Finalizar compra</button>
    </div>
    <span class="heart">💞</span>
  `;
  msgDiv.style.display = 'flex'; // Torna o popup visível

  // Adiciona o evento de clique para o botão "Continuar comprando"
  document.getElementById('btn-continuar').onclick = function() {
    msgDiv.style.display = 'none';
    // Apenas redireciona para a página de produtos.
    // A lógica de exibir o botão de gerente será tratada em produtos.js
    window.location.href = 'produtos.html';
  };

  // Adiciona o evento de clique para o botão "Finalizar compra"
  document.getElementById('btn-finalizar').onclick = function() {
    msgDiv.style.display = 'none';
    // Redireciona para o carrinho. A página do carrinho também deve
    // verificar se o usuário está logado antes de prosseguir.
    window.location.href = 'carrinho.html';
  };
}



/**
 * Função principal de login, acionada pelo submit do formulário.
 */
async function fazerLogin(event) {
  event.preventDefault(); // Impede o recarregamento da página

  const email = document.getElementById('email-login').value.trim();
  const senha = document.getElementById('senha-login').value;

  // Validação simples no frontend
  if (!email || !senha) {
    alert('Por favor, preencha o e-mail e a senha.');
    return;
  }

  try {
    // Passo 1: Verificar se o e-mail existe no backend
    const resEmail = await fetch('http://localhost:3000/login/verificarEmail', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email } )
    });

    if (!resEmail.ok) {
      // Se o status da resposta não for OK (ex: 404 Not Found), lança um erro
      throw new Error('E-mail não encontrado. Verifique o e-mail ou cadastre-se.');
    }
    // Não precisamos do resultado aqui, apenas da confirmação que o e-mail existe.

    // Passo 2: Verificar a senha
    const resSenha = await fetch('http://localhost:3000/login/verificarSenha', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, senha } )
    });

    if (!resSenha.ok) {
      // Se a senha estiver incorreta (ex: 401 Unauthorized), lança um erro
      throw new Error('Senha incorreta!');
    }

    // Se a senha estiver correta, o backend retorna os dados do usuário
    const dadosLogin = await resSenha.json();

    // Passo 3: Salvar os dados do usuário no localStorage
    // JSON.stringify converte o objeto do usuário em uma string para armazenamento
    localStorage.setItem('usuario', JSON.stringify(dadosLogin));

    // Passo 4: Exibir o popup de boas-vindas
    mostrarPopupLogin(dadosLogin);

  } catch (err) {
    // Exibe uma mensagem de erro amigável para o usuário
    alert('Erro ao fazer login: ' + err.message);
  }
}

// --- Event Listeners ---
// Aguarda o carregamento completo do DOM para adicionar os eventos
window.addEventListener('DOMContentLoaded', () => {
  // Associa a função de login ao formulário
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.onsubmit = fazerLogin;
  }

  // Lógica para alternar entre as abas de Login e Cadastro
  const btnLogin = document.getElementById('btn-login');
  const btnCadastro = document.getElementById('btn-cadastrar');
  const formCadastro = document.getElementById('form-cadastro');
  const loginForm = document.getElementById('form-login'); // Renomeado para evitar conflito

  if (btnLogin && btnCadastro && formCadastro && loginForm) {
    btnLogin.addEventListener('click', () => {
      btnLogin.classList.add('active');
      btnCadastro.classList.remove('active');
      loginForm.classList.remove('hidden');
      formCadastro.classList.add('hidden');
    });

    btnCadastro.addEventListener('click', () => {
      btnCadastro.classList.add('active');
      btnLogin.classList.remove('active');
      formCadastro.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });
  }
});

// ... (todo o seu código, incluindo as funções que você acabou de colar) ...


// =================================================================
// COLE ESTE CÓDIGO NO FINAL DO SEU ARQUIVO JS
// =================================================================

// Encontra o formulário de login no seu HTML pelo ID dele
// !!! IMPORTANTE: Troque 'id-do-seu-formulario-de-login' pelo ID real !!!
const formLogin = document.getElementById('id-do-seu-formulario-de-login');

// Adiciona um "ouvinte" que espera pelo evento 'submit' (envio) do formulário.
// Se o formulário existir, ele conecta a função handleLogin a ele.
if (formLogin) {
    formLogin.addEventListener('submit', handleLogin);
} else {
    console.error('Erro: Formulário de login não encontrado! Verifique o ID.');
}

// FIM DO ARQUIVO
