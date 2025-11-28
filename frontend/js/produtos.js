// ===================================================================================
// ARQUIVO: produtos.js (COMPLETO E ATUALIZADO)
// Inclui a lógica de filtro de produtos e listeners de pesquisa.
// ===================================================================================

// ==================== DADOS: LISTA SIMULADA DE PRODUTOS ====================
// Esta lista é usada para popular a grade e será filtrada pela pesquisa.
const produtos = [
  { nome: "Rosa Vermelha", descricao: "Símbolo de amor intenso. Perfeita para presentear.", preco: "R$ 35,00", imagem: "../images/rosa-vermelha.jpg" },
  { nome: "Orquídea Phalaenopsis", descricao: "Elegante e duradoura. Ideal para ambientes internos.", preco: "R$ 78,90", imagem: "../images/orquidea.jpg" },
  { nome: "Girassol", descricao: "Traz alegria e energia. Segue a luz do sol.", preco: "R$ 42,50", imagem: "../images/girassol.jpg" },
  { nome: "Lavanda", descricao: "Aroma calmante e relaxante. Atrai tranquilidade.", preco: "R$ 28,00", imagem: "../images/lavanda.jpg" },
  { nome: "Margarida", descricao: "Pequena e delicada. Simboliza a inocência.", preco: "R$ 22,90", imagem: "../images/margarida.jpg" },
  { nome: "Violeta Africana", descricao: "Fácil de cuidar. Floresce o ano todo.", preco: "R$ 18,50", imagem: "../images/violeta.jpg" },
  { nome: "Jasmim Manga", descricao: "Perfume intenso e marcante. Mudas de porte médio.", preco: "R$ 65,00", imagem: "../images/jasmim.jpg" },
  { nome: "Tulipa", descricao: "Cores vibrantes para a primavera. Efeito único.", preco: "R$ 49,90", imagem: "../images/tulipa.jpg" },
];
// ============================================================================


// ==================== LÓGICA DE GERENCIAMENTO ====================
function exibeBotaoGerenciamento() {
const usuarioString = localStorage.getItem('usuario');
if (usuarioString) {
  const usuario = JSON.parse(usuarioString);
  const btnGerenciamento = document.getElementById('btn-gerenciamento');
  if (usuario && usuario.tipo === 'gerente' && btnGerenciamento) {
    btnGerenciamento.style.display = 'block'; 
  }
}
}

// ==================== LÓGICA DE EXIBIÇÃO DE PRODUTOS (FILTRO) ====================

/**
* Filtra e exibe os produtos na tela com base em um termo de pesquisa.
* @param {string} searchTerm O termo de pesquisa digitado pelo usuário.
*/
function exibeProdutos(searchTerm = '') {
  const container = document.getElementById('products-grid');
  container.innerHTML = "";
  
  // Converte o termo de pesquisa para minúsculas e remove espaços extras
  const term = searchTerm.toLowerCase().trim();

  // Filtra os produtos
  const produtosFiltrados = produtos.filter(produto => {
      // Se não houver termo de pesquisa, mostra todos
      if (!term) return true;
      // Verifica se o nome ou a descrição contêm o termo
      return produto.nome.toLowerCase().includes(term) || 
             produto.descricao.toLowerCase().includes(term);
  });

  if (produtosFiltrados.length === 0) {
      container.innerHTML = `
          <p style="grid-column: 1 / -1; text-align: center; font-size: 1.5rem; color: #ff6b9d; margin-top: 30px;">
              💔 Que pena! Nenhuma flor com o nome ou descrição de "${searchTerm}" foi encontrada. 
          </p>
      `;
      return;
  }


  produtosFiltrados.forEach(produto => {
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


// ==================== LÓGICA DE PESQUISA (NOVA) ====================

/**
* Adiciona o listener para o campo de pesquisa e chama o filtro a cada digitação.
*/
function setupSearchListener() {
  const searchInput = document.getElementById('search-input');
  
  if (searchInput) {
      searchInput.addEventListener('input', (event) => {
          exibeProdutos(event.target.value);
      });
  }
}


// ==================== LÓGICA DO CARRINHO (INCLUÍDA) ====================

function getCarrinho() {
return JSON.parse(localStorage.getItem('carrinho')) || [];
}

function setCarrinho(carrinho) {
localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function getPedidos() {
return JSON.parse(localStorage.getItem('pedidos')) || [];
}

function setPedidos(pedidos) {
localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function atualizarContadorCarrinho() {
const carrinho = getCarrinho();
const count = carrinho.length;
const countSpan = document.getElementById('cart-count');
if (countSpan) {
  if (count > 0) {
    countSpan.textContent = `(${count})`;
  } else {
    countSpan.textContent = '';
  }
}
}

function adicionarAoCarrinho(nomeProduto) {
const carrinho = getCarrinho();
carrinho.push(nomeProduto);
setCarrinho(carrinho);

const pedidos = getPedidos();
pedidos.push({
  nome: nomeProduto,
  data: new Date().toLocaleString('pt-BR')
});
setPedidos(pedidos);

const msgDiv = document.getElementById('cart-message');
if (msgDiv) {
    msgDiv.className = 'cart-message';
    msgDiv.innerHTML = `<span class="heart">💖</span> Seu pedido de <b>${nomeProduto}</b> foi adicionado com sucesso ao carrinho! <span class="heart">💕</span>`;
    msgDiv.style.display = 'flex';

    setTimeout(() => {
      msgDiv.style.display = 'none';
    }, 2200);
}

atualizarContadorCarrinho();
}


// ==================== CORAÇÕES FLUTUANTES (INCLUÍDA) ====================
function createHearts() {
const floating = document.querySelector('.floating-hearts');
const side = document.querySelector('.side-hearts');
const heartEmojis = ['💗', '💕', '💞', '💖'];

// Limpa containers
if(floating) floating.innerHTML = '';
if(side) side.innerHTML = '';


// Corações flutuantes centrais (Floating-Hearts)
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
if(floating) {
    floatHearts.forEach((pos, i) => {
      const heart = document.createElement('span');
      heart.className = `heart heart-${i+1}`;
      heart.innerHTML = heartEmojis[i % heartEmojis.length];
      Object.assign(heart.style, pos);
      heart.style.animationDelay = pos.delay;
      floating.appendChild(heart);
    });
}


// Corações laterais (Side-Hearts)
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
if(side) {
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
}


// ==================== INICIALIZAÇÃO ====================
window.addEventListener('DOMContentLoaded', function() {
exibeProdutos(); // 1. Inicia exibindo todos os produtos
setupSearchListener(); // 2. Configura a barra de pesquisa
createHearts(); // 3. Cria os corações
atualizarContadorCarrinho(); // 4. Atualiza o contador
exibeBotaoGerenciamento(); // 5. Exibe o botão de gerenciamento (se for gerente)
});