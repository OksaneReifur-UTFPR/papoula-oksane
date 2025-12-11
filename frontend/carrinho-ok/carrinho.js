// carrinho.js — adaptado: suporte a sessionStorage/localStorage, catálogo e integração com a UI nova

const API_BASE_URL = 'http://localhost:3000'; // ajuste se necessário

// Catálogo simplificado (use os nomes/imagens do seu projeto)
const CATALOG = [
  { id: 1, nome: "Muda de Cosmos Chocolate", preco: 15.00, imagem: "../images/cosmoschocolate.jpg" },
  { id: 2, nome: "Muda de Girassol", preco: 12.00, imagem: "../images/girassol.jpg" },
  { id: 3, nome: "Muda de Rosa Rubra", preco: 13.00, imagem: "../images/rosa-rubra.jpg" },
  { id: 4, nome: "Muda de Aconito", preco: 14.00, imagem: "../images/aconito.jpg" },
  { id: 5, nome: "Muda de Afelandra Coral", preco: 15.00, imagem: "../images/afelandra-coral.jpg" },
  { id: 6, nome: "Muda de Anemona", preco: 16.00, imagem: "../images/anemona.jpg" },
  { id: 7, nome: "Muda de Begonia Negra", preco: 17.00, imagem: "../images/begonia-negra.jpg" },
  { id: 8, nome: "Muda de Beldroega Grande", preco: 18.00, imagem: "../images/beldroega-grande.jpg" },
  { id: 9, nome: "Muda de Chapeu Chines", preco: 19.00, imagem: "../images/chapeu-chines.jpg" },
  { id: 10, nome: "Muda de Cipo de Sao Joao", preco: 20.00, imagem: "../images/cipo-de-sao-joao.jpg" },
  { id: 11, nome: "Muda de Crossandra", preco: 21.00, imagem: "../images/crossandra.jpg" },
  { id: 12, nome: "Muda de Escovinha", preco: 22.00, imagem: "../images/escovinha.jpg" },
  { id: 13, nome: "Muda de Espirradeira", preco: 23.00, imagem: "../images/espirradeira.jpg" },
  { id: 14, nome: "Muda de Heliconia", preco: 24.00, imagem: "../images/heliconia.jpg" },
  { id: 15, nome: "Muda de Jacaranda", preco: 25.00, imagem: "../images/jacaranda.jpg" },
  { id: 16, nome: "Muda de Flor de Sao Jose", preco: 26.00, imagem: "../images/flor-de-sao-jose.jpg" },
  { id: 17, nome: "Muda de Orquidea Fantasma", preco: 27.00, imagem: "../images/orquideafantasma.jpg" },
  { id: 18, nome: "Muda de Vine Jade", preco: 28.00, imagem: "../images/vinejade.jpg" },
  { id: 19, nome: "Muda de Flor de Carajás", preco: 29.00, imagem: "../images/flordecarajás.jpeg" },
  { id: 20, nome: "Muda de Rosa Juliet", preco: 30.00, imagem: "../images/rosajulieta.jpeg" }
];

// Estado do carrinho (normalizado)
let carrinho = [];

// Helpers de armazenamento (salva em sessionStorage e localStorage para compatibilidade)
function salvarCarrinho() {
  try {
    const json = JSON.stringify(carrinho);
    sessionStorage.setItem('carrinho', json);
    localStorage.setItem('carrinho', json);
    return true;
  } catch (e) {
    console.error('Erro ao salvar carrinho:', e);
    return false;
  }
}

function carregarCarrinho() {
  let raw = sessionStorage.getItem('carrinho') || localStorage.getItem('carrinho');
  if (!raw) {
    // suporta formato antigo que armazenava apenas nomes (exemplo enviado)
    const antigo = localStorage.getItem('carrinho');
    if (!antigo) {
      carrinho = [];
      return carrinho;
    }
    raw = antigo;
  }

  try {
    const parsed = JSON.parse(raw);
    // parsed pode ser array de strings (nomes) ou array de objetos
    if (!Array.isArray(parsed)) {
      carrinho = [];
      return carrinho;
    }

    carrinho = parsed.map(item => {
      // se for string -> buscar no catálogo
      if (typeof item === 'string') {
        const produto = CATALOG.find(p => p.nome === item);
        if (!produto) return null;
        return { id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1, imagem: produto.imagem };
      }

      // se for objeto com id_produto ou id
      if (typeof item === 'object') {
        const id = item.id_produto || item.id || null;
        if (id) {
          const produto = CATALOG.find(p => p.id === id) || CATALOG.find(p => p.nome === item.nome_produto || item.nome);
          const nome = item.nome_produto || item.nome || (produto ? produto.nome : 'Produto');
          const preco = parseFloat(item.preco) || (produto ? produto.preco : 0);
          const quantidade = parseInt(item.quantidade) || 1;
          const imagem = (produto && produto.imagem) || item.imagem || '../images/placeholder.jpg';
          return { id: id || (produto ? produto.id : null), nome, preco, quantidade, imagem };
        } else {
          // fallback: tentar usar nome
          const produto = CATALOG.find(p => p.nome === item.nome || item.nome_produto);
          const nome = item.nome || item.nome_produto || (produto ? produto.nome : 'Produto');
          const preco = parseFloat(item.preco) || (produto ? produto.preco : 0);
          const imagem = (produto && produto.imagem) || item.imagem || '../images/placeholder.jpg';
          const quantidade = parseInt(item.quantidade) || 1;
          return { id: produto ? produto.id : null, nome, preco, quantidade, imagem };
        }
      }

      return null;
    }).filter(Boolean);

  } catch (e) {
    console.error('Erro ao parsear carrinho:', e);
    carrinho = [];
  }

  return carrinho;
}

// Renderiza itens na página (markup compatível com o CSS atual)
function renderizarCarrinho() {
  const lista = document.getElementById('carrinho-lista');
  const totalSpan = document.querySelector('.total-valor');
  if (!lista || !totalSpan) return;

  if (!carrinho || carrinho.length === 0) {
    lista.innerHTML = `<p style="text-align:center;margin:2rem 0;color:#ff6b9d;font-size:1.2rem;">Seu carrinho está vazio. Adicione itens para ver aqui! 💗</p>`;
    totalSpan.textContent = "R$ 0,00";
    return;
  }

  let html = '';
  let total = 0;

  carrinho.forEach((item, index) => {
    const preco = parseFloat(item.preco) || 0;
    const quantidade = parseInt(item.quantidade) || 1;
    const subtotal = preco * quantidade;
    total += subtotal;

    const precoDisplay = `R$ ${preco.toFixed(2).replace('.', ',')}`;

    html += `
      <div class="item-carrinho" data-index="${index}">
        <img src="${item.imagem || '../images/placeholder.jpg'}" alt="${item.nome}" class="item-imagem" onerror="this.onerror=null;this.src='https://via.placeholder.com/70'">
        <div class="item-info">
            <h3>${item.nome}</h3>
            <p class="item-descricao"></p>
            <div class="item-quantidade">
                <button class="btn-quantidade" onclick="alterarQuantidade(${index}, -1)">-</button>
                <span id="qtd-${index}">${quantidade}</span>
                <button class="btn-quantidade" onclick="alterarQuantidade(${index}, 1)">+</button>
            </div>
        </div>
        <div class="item-preco">${precoDisplay}</div>
        <button class="btn-remover" onclick="removerDoCarrinho(${index})">Remover 💔</button>
      </div>
    `;
  });

  lista.innerHTML = html;
  totalSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Operações: remover, alterar quantidade
function removerDoCarrinho(index) {
  if (index == null || index < 0 || index >= carrinho.length) return;
  const nome = carrinho[index].nome;
  if (!confirm(`Remover "${nome}" do carrinho?`)) return;

  carrinho.splice(index, 1);
  salvarCarrinho();
  renderizarCarrinho();
}

function alterarQuantidade(index, delta) {
  if (index == null || index < 0 || index >= carrinho.length) return;
  const item = carrinho[index];
  const nova = (parseInt(item.quantidade) || 1) + delta;
  if (nova <= 0) {
    // confirm remove
    if (confirm(`Quantidade ficará zero. Remover "${item.nome}" do carrinho?`)) {
      removerDoCarrinho(index);
    }
    return;
  }
  item.quantidade = nova;
  salvarCarrinho();
  // atualizar quantidade no DOM sem re-render completo para suavidade
  const qtdSpan = document.getElementById(`qtd-${index}`);
  if (qtdSpan) qtdSpan.textContent = nova;
  renderizarCarrinho();
}

// Finalizar pedido: verifica usuário e envia (ou redireciona)
async function finalizarPedido() {
  // tenta recuperar usuário de sessionStorage ou localStorage
  let usuario = null;
  try {
    usuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || localStorage.getItem('usuario') || localStorage.getItem('usuarioLogado') || sessionStorage.getItem('usuario'));
  } catch (e) {
    usuario = null;
  }

  if (!usuario || !usuario.cpf && !usuario.id) {
    alert('Você precisa estar logado para finalizar o pedido.');
    window.location.href = '../auth/login.html';
    return;
  }

  if (!carrinho || carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  const cpf = usuario.cpf || usuario.id;
  const itensParaEnvio = carrinho.map(i => ({ id: i.id, nome: i.nome, preco: i.preco, quantidade: i.quantidade }));

  const pedido = {
    cpf,
    data: new Date().toISOString(),
    itens: itensParaEnvio,
    total: itensParaEnvio.reduce((s, it) => s + (parseFloat(it.preco) * (parseInt(it.quantidade) || 1)), 0)
  };

  try {
    // Tenta enviar para API; se falhar, salva localmente e notifica
    const resp = await fetch(`${API_BASE_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
      credentials: 'include'
    });

    if (resp.ok) {
      alert('Pedido finalizado com sucesso!');
      carrinho = [];
      salvarCarrinho();
      renderizarCarrinho();
      // redireciona para página de finalização se existir
      setTimeout(() => window.location.href = '../finalizacao/finalizacao.html', 300);
      return;
    } else {
      console.warn('Resposta não ok ao enviar pedido, status:', resp.status);
      // fallback: salvar pedido localmente para processamento posterior
      salvarPedidoLocal(pedido);
      alert('Pedido salvo localmente. Tente finalizar novamente ou contate o suporte.');
    }
  } catch (e) {
    console.error('Erro ao enviar pedido:', e);
    salvarPedidoLocal(pedido);
    alert('Erro de conexão. Pedido salvo localmente.');
  }
}

function salvarPedidoLocal(pedido) {
  const fila = JSON.parse(localStorage.getItem('pedidos_offline') || '[]');
  fila.push(pedido);
  localStorage.setItem('pedidos_offline', JSON.stringify(fila));
}

// Função pública para adicionar item (compatível com outras telas)
window.adicionarAoCarrinho = function(produto, quantidade = 1) {
  // produto pode ser um nome, id, ou objeto
  let item = null;

  if (typeof produto === 'string') {
    const p = CATALOG.find(c => c.nome === produto);
    if (!p) return false;
    item = { id: p.id, nome: p.nome, preco: p.preco, quantidade };
  } else if (typeof produto === 'object') {
    const p = CATALOG.find(c => c.id === (produto.id_produto || produto.id));
    if (p) {
      item = { id: p.id, nome: p.nome, preco: p.preco, quantidade };
    } else {
      // aceitar objeto com nome/preco
      item = { id: produto.id_produto || produto.id || null, nome: produto.nome_produto || produto.nome || 'Produto', preco: parseFloat(produto.preco) || 0, quantidade };
    }
  }

  if (!item) return false;

  const existente = carrinho.find(i => i.id && item.id && i.id === item.id);
  if (existente) {
    existente.quantidade = (parseInt(existente.quantidade) || 1) + quantidade;
  } else {
    carrinho.push(item);
  }
  salvarCarrinho();
  renderizarCarrinho();
  return true;
};

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  carregarCarrinho();
  renderizarCarrinho();

  const btn = document.getElementById('btn-finalizar');
  if (btn) {
    btn.addEventListener('click', finalizarPedido);
  }
});