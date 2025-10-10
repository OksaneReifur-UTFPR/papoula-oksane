// EM SEU ARQUIVO produtos.js

// ===================================================================================
// SUBSTITUA A SUA FUNÇÃO 'exibeBotaoGerenciamento' POR ESTA VERSÃO ATUALIZADA
// ===================================================================================
function exibeBotaoGerenciamento() {
  // 1. Pega o usuário do localStorage (você já fazia isso, está perfeito!)
  //    Vamos assumir que ao fazer login, você salva algo como:
  //    localStorage.setItem('usuario', JSON.stringify({ tipo: 'gerente' }));
  const usuarioString = localStorage.getItem('usuario');

  // 2. Verifica se existe um usuário salvo
  if (usuarioString) {
    // 3. Converte a string de volta para um objeto
    const usuario = JSON.parse(usuarioString);

    // 4. Encontra o botão que já existe no HTML pelo seu ID
    const btnGerenciamento = document.getElementById('btn-gerenciamento');

    // 5. Se o usuário for 'gerente' E o botão existir, torna o botão visível
    if (usuario && usuario.tipo === 'gerente' && btnGerenciamento) {
      btnGerenciamento.style.display = 'block'; // 'block' ou 'inline-block' funcionam bem aqui
    }
  }
}
// ===================================================================================





// Função para exibir os produtos na tela
function exibeProdutos() {
  const container = document.getElementById('products-grid');
  container.innerHTML = "";

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">
        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='https://placehold.co/300x200/ffd6e0/ffffff?text=${encodeURIComponent(produto.nome)}'">
      </div>
      <div class="product-info">
        <h3 class="product-title">${produto.nome}</h3>
        <p class="product-description">${produto.descricao}</p>
        <p class="product-price">${produto.preco}</p>
        <button class="add-to-cart" onclick="adicionarAoCarrinho('${produto.nome.replace(/'/g, "\\'")}')">Adicionar ao Carrinho</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== CARRINHO NO LOCALSTORAGE ====================

// Função para obter o carrinho do localStorage
function getCarrinho() {
  return JSON.parse(localStorage.getItem('carrinho')) || [];
}

// Função para salvar o carrinho no localStorage
function setCarrinho(carrinho) {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// ==================== PEDIDOS NO LOCALSTORAGE ====================

// Função para obter pedidos salvos
function getPedidos() {
  return JSON.parse(localStorage.getItem('pedidos')) || [];
}

// Função para salvar pedidos
function setPedidos(pedidos) {
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
}


// Função para atualizar o contador do carrinho no menu
function atualizarContadorCarrinho() {
  const carrinho = getCarrinho();
  const count = carrinho.length;
  const countSpan = document.getElementById('cart-count');
  if (count > 0) {
    countSpan.textContent = `(${count})`;
  } else {
    countSpan.textContent = '';
  }
}
// ==================== PEDIDOS NO LOCALSTORAGE ====================

// Função para obter pedidos salvos
function getPedidos() {
  return JSON.parse(localStorage.getItem('pedidos')) || [];
}

// Função para salvar pedidos
function setPedidos(pedidos) {
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
}


// Função para mostrar recadinho carinhoso
function mostrarMensagemCarinho(nomeProduto) {
  const msgDiv = document.getElementById('cart-message');
  msgDiv.className = 'cart-message';
  msgDiv.innerHTML = `<span class="heart">💖</span> Que alegria, <b>${nomeProduto}</b> foi adicionado ao seu carrinho com amor! <span class="heart">💕</span>`;
  msgDiv.style.display = 'flex';
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 2200);
}

 function adicionarAoCarrinho(nomeProduto) {
  // Adiciona ao carrinho
  const carrinho = getCarrinho();
  carrinho.push(nomeProduto);
  setCarrinho(carrinho);

  // Também adiciona aos pedidos
  const pedidos = getPedidos();
  pedidos.push({
    nome: nomeProduto,
    data: new Date().toLocaleString('pt-BR')
  });
  setPedidos(pedidos);

  // Mostra a mensagem carinhosa personalizada
  const msgDiv = document.getElementById('cart-message');
  msgDiv.className = 'cart-message';
  msgDiv.innerHTML = `<span class="heart">💖</span> Seu pedido de <b>${nomeProduto}</b> foi adicionado com sucesso ao carrinho! <span class="heart">💕</span>`;
  msgDiv.style.display = 'flex';

  // Some depois de 2 segundos
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 2200);

  // Atualiza contador do carrinho
  atualizarContadorCarrinho();
}

// ==================== Corações flutuantes decorados ====================
function createHearts() {
  document.querySelector('.floating-hearts').innerHTML = '';
  document.querySelector('.side-hearts').innerHTML = '';
  const floating = document.querySelector('.floating-hearts');
  const side = document.querySelector('.side-hearts');
  const heartEmojis = ['💗', '💕', '💞', '💖'];

  // Corações flutuantes centrais
  const floatHearts = [
    {top: '8%', left: '2%', delay: '0s'},
    {top: '15%', right: '3%', delay: '1s'},
    {top: '25%', left: '5%', delay: '2s'},
    {top: '35%', right: '7%', delay: '3s'},
    {top: '45%', left: '3%', delay: '4s'},
    {top: '55%', right: '4%', delay: '5s'},
    {top: '65%', left: '6%', delay: '1.5s'},
    {top: '75%', right: '2%', delay: '2.5s'},
    {top: '85%', left: '4%', delay: '3.5s'},
    {top: '20%', left: '8%', delay: '4.5s'},
    {top: '50%', right: '8%', delay: '0.5s'},
    {top: '70%', left: '2%', delay: '1.8s'},
  ];
  floatHearts.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `heart heart-${i+1}`;
    heart.innerHTML = heartEmojis[i % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    floating.appendChild(heart);
  });

  // Corações laterais
  const leftPositions = [
    {top: '12%', left: '0.5%', delay: '0s'},
    {top: '30%', left: '1%', delay: '2s'},
    {top: '48%', left: '0.8%', delay: '4s'},
    {top: '66%', left: '1.2%', delay: '6s'},
    {top: '84%', left: '0.7%', delay: '1s'},
  ];
  const rightPositions = [
    {top: '18%', right: '0.5%', delay: '3s'},
    {top: '36%', right: '1%', delay: '5s'},
    {top: '54%', right: '0.8%', delay: '1s'},
    {top: '72%', right: '1.2%', delay: '3s'},
    {top: '90%', right: '0.7%', delay: '7s'},
  ];
  leftPositions.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `side-heart left-${i+1}`;
    heart.innerHTML = heartEmojis[i % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    side.appendChild(heart);
  });
  rightPositions.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `side-heart right-${i+1}`;
    heart.innerHTML = heartEmojis[(i+1) % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    side.appendChild(heart);
  });
}

window.addEventListener('DOMContentLoaded', function() {
  exibeProdutos();
  createHearts();
  atualizarContadorCarrinho();
  exibeBotaoGerenciamento(); // Esta chamada já estava correta, mantenha-a!
});