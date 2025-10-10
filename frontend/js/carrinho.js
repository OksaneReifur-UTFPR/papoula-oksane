// Função para pegar os itens do carrinho do localStorage
function getCarrinho() {
  return JSON.parse(localStorage.getItem('carrinho')) || [];
}

// Função para remover item do carrinho pelo índice
function removerDoCarrinho(index) {
  const carrinho = getCarrinho();
  carrinho.splice(index, 1);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  exibirCarrinho(); // Atualiza a tela
}

// Função para exibir os itens do carrinho e o total
function exibirCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  const carrinho = getCarrinho();
  let total = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = `<p style="text-align:center;margin:2rem 0;color:#ff6b9d;font-size:1.2rem;">Seu carrinho está vazio. Adicione mudas para ver aqui! 💗</p>`;
    document.querySelector('.total-valor').textContent = "R$ 0,00";
    return;
  }

  // Catálogo dos produtos, igual ao produtos.js (nome, preco, imagem)
  const catalogo = [
    { nome: "Muda de Cosmos Chocolate", preco: "R$ 15,00", imagem: "../images/cosmoschocolate.jpg" },
    { nome: "Muda de Girassol", preco: "R$ 12,00", imagem: "../images/girassol.jpg" },
    { nome: "Muda de Rosa Rubra", preco: "R$ 13,00", imagem: "../images/rosa-rubra.jpg" },
    { nome: "Muda de Aconito", preco: "R$ 14,00", imagem: "../images/aconito.jpg" },
    { nome: "Muda de Afelandra Coral", preco: "R$ 15,00", imagem: "../images/afelandra-coral.jpg" },
    { nome: "Muda de Anemona", preco: "R$ 16,00", imagem: "../images/anemona.jpg" },
    { nome: "Muda de Begonia Negra", preco: "R$ 17,00", imagem: "../images/begonia-negra.jpg" },
    { nome: "Muda de Beldroega Grande", preco: "R$ 18,00", imagem: "../images/beldroega-grande.jpg" },
    { nome: "Muda de Chapeu Chines", preco: "R$ 19,00", imagem: "../images/chapeu-chines.jpg" },
    { nome: "Muda de Cipo de Sao Joao", preco: "R$ 20,00", imagem: "../images/cipo-de-sao-joao.jpg" },
    { nome: "Muda de Crossandra", preco: "R$ 21,00", imagem: "../images/crossandra.jpg" },
    { nome: "Muda de Escovinha", preco: "R$ 22,00", imagem: "../images/escovinha.jpg" },
    { nome: "Muda de Espirradeira", preco: "R$ 23,00", imagem: "../images/espirradeira.jpg" },
    { nome: "Muda de Heliconia", preco: "R$ 24,00", imagem: "../images/heliconia.jpg" },
    { nome: "Muda de Jacaranda", preco: "R$ 25,00", imagem: "../images/jacaranda.jpg" },
    { nome: "Muda de Flor de Sao Jose", preco: "R$ 26,00", imagem: "../images/flor-de-sao-jose.jpg" },
    { nome: "Muda de Orquidea Fantasma", preco: "R$ 27,00", imagem: "../images/orquideafantasma.jpg" },
    { nome: "Muda de Vine Jade", preco: "R$ 28,00", imagem: "../images/vinejade.jpg" },
    { nome: "Muda de Flor de Carajás", preco: "R$ 29,00", imagem: "../images/flordecarajás.jpeg" },
    { nome: "Muda de Rosa Juliet", preco: "R$ 30,00", imagem: "../images/rosajulieta.jpeg" }
  ];

  let html = '';
  carrinho.forEach((nomeProduto, i) => {
    const produto = catalogo.find(p => p.nome === nomeProduto);
    if (!produto) return; // ignora se não encontrar no catálogo
    const valor = parseFloat(produto.preco.replace('R$', '').replace(',', '.').trim());
    total += valor;
    html += `
      <div class="item-carrinho">
        <img src="${produto.imagem}" alt="${produto.nome}" class="item-imagem">
        <div class="item-info">
            <h3>${produto.nome}</h3>
            <p class="item-descricao"></p>
            <div class="item-quantidade">
                <button class="btn-quantidade" onclick="alterarQuantidade(${i}, -1)">-</button>
                <span>1</span>
                <button class="btn-quantidade" onclick="alterarQuantidade(${i}, 1)">+</button>
            </div>
        </div>
        <div class="item-preco">${produto.preco}</div>
        <button class="btn-remover" onclick="removerDoCarrinho(${i})">Remover 💔</button>
      </div>
    `;
  });

  lista.innerHTML = html;
  document.querySelector('.total-valor').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Função (dummy) para alterar quantidade (futuro)
function alterarQuantidade(index, delta) {
  alert('Funcionalidade de quantidade pode ser implementada depois!');
}

// Função para finalizar pedido usando CPF do usuário logado
async function finalizarPedido() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || !usuario.cpf) {
    alert('Você precisa estar logado para finalizar o pedido.');
    window.location.href = 'cadastro.html';
    return;
  }

  const cpf = usuario.cpf;
  const dataPedido = new Date().toISOString().slice(0, 10);
  const carrinho = getCarrinho();

  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  // Monta objeto pedido
  const pedido = {
    cpf: cpf,
    data: dataPedido,
    itens: carrinho
  };

  try {
    // Exemplo de envio para backend (ajuste URL e método conforme sua API)
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido)
    });

    if (!response.ok) throw new Error('Erro ao enviar pedido');

    alert('Pedido finalizado com sucesso!');
    localStorage.removeItem('carrinho'); // limpa carrinho
    exibirCarrinho(); // atualiza visual
  } catch (error) {
    console.error(error);
    alert('Erro ao finalizar o pedido. Tente novamente.');
  }
}

// Inicializa a página ao carregar
window.addEventListener('DOMContentLoaded', exibirCarrinho);

// Associa o botão de finalizar
document.querySelector('.btn-finalizar')
  .addEventListener('click', finalizarPedido);
