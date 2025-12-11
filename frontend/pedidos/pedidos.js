// Frontend para "Meus Pedidos" adaptado ao seu backend.
// Busca /pedido e exibe apenas pedidos do usuário autenticado (quando disponível).

const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindUserMenu();
  await carregarPedidosUsuario();
}

// tenta obter dados do usuário via cookie ou sessionStorage
function lerCookie(nome) {
  const name = nome + '=';
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.indexOf(name) === 0) return decodeURIComponent(c.substring(name.length));
  }
  return null;
}

function obterUsuarioLogado() {
  // Prioriza cookie userId e userName
  const userId = lerCookie('userId') || null;
  const userName = lerCookie('userName') || null;
  if (userId || userName) {
    return { id: userId, nome: userName };
  }

  // fallback sessionStorage (format assumed from other pages)
  const userSession = sessionStorage.getItem('usuarioLogado');
  if (userSession) {
    try { return JSON.parse(userSession); } catch(e){}
  }

  return null;
}

function bindUserMenu() {
  const menu = document.getElementById('userMenu');
  if (!menu) return;
  menu.addEventListener('change', (e) => {
    const v = e.target.value;
    if (v === 'sair') {
      // limpar session e cookies mínimos (front-end)
      sessionStorage.removeItem('usuarioLogado');
      document.cookie = 'userId=; path=/; max-age=0';
      document.cookie = 'userName=; path=/; max-age=0';
      window.location.href = '../auth/login.html';
    } else if (v === 'menu') {
      window.location.href = '../menu.html';
    }
    menu.value = '';
  });
}

async function carregarPedidosUsuario() {
  const listaContainer = document.getElementById('pedidos-lista');
  listaContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><h2 class="empty-title">Carregando seus pedidos...</h2><p class="empty-description">Aguarde um momento.</p></div>`;

  const usuario = obterUsuarioLogado();
  try {
    const resp = await fetch(`${API_BASE_URL}/pedido`, { credentials: 'include' });
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    let data = await resp.json();

    // data pode vir em formatos diferentes (array ou {rows: [...]})
    const pedidos = Array.isArray(data) ? data : (data.rows || data.data || []);

    // se usuário logado, filtra por CPF (campo pode ser 'cpf' ou 'cpf_cliente' dependendo do backend)
    let pedidosFiltrados = pedidos;
    if (usuario && usuario.id) {
      pedidosFiltrados = pedidos.filter(p => {
        const cpf = p.cpf || p.cpf_cliente || p.cpf_cliente_pedido || '';
        // comparar strings sem formatação
        return String(cpf).replace(/\D/g,'') === String(usuario.id).replace(/\D/g,'');
      });
    }

    renderizarPedidos(pedidosFiltrados, usuario);
  } catch (err) {
    console.error('Erro ao carregar pedidos:', err);
    listaContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h2 class="empty-title">Não foi possível carregar os pedidos</h2><p class="empty-description">Tente novamente mais tarde.</p></div>`;
  }
}

function formatarData(dataString) {
  if (!dataString) return '-';
  const d = new Date(dataString);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
}

function formatarMoeda(v) {
  const n = Number(v) || 0;
  return n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

function renderizarPedidos(pedidos, usuario) {
  const container = document.getElementById('pedidos-lista');
  if (!container) return;

  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📦</div>
      <h2 class="empty-title">Ainda não há pedidos por aqui!</h2>
      <p class="empty-description">Que tal fazer um pedido? Visite nosso <a href="../produtos/produtos.html">catálogo</a>.</p>
      <div style="margin-top:12px;"><a class="btn-primary" href="../produtos/produtos.html">Ver Produtos</a></div>
    </div>`;
    return;
  }

  const listEl = document.createElement('div');
  listEl.className = 'pedidos-list';

  pedidos.forEach(p => {
    const pedidoId = p.id_pedido || p.id || '—';
    const data = p.data_pedido || p.data || p.created_at || '';
    const valor = p.valor_total || p.valor_total_pedido || p.valor || p.valor_total_pagamento || 0;
    const itensCount = p.itens_count || p.itens || p.total_itens || ''; // optional

    const card = document.createElement('div');
    card.className = 'pedido-card';
    card.innerHTML = `
      <div class="pedido-info">
        <div>
          <div class="pedido-meta">Pedido #${pedidoId}</div>
          <div class="pedido-data">${formatarData(data)}</div>
        </div>
        <div style="margin-left:12px;">
          <div class="pedido-valor">${formatarMoeda(valor)}</div>
          ${itensCount ? `<div style="font-size:0.85rem;color:#777">${itensCount} itens</div>` : ''}
        </div>
      </div>

      <div class="pedido-actions">
        <button class="btn-small" data-id="${pedidoId}" onclick="verDetalhesPedido(event)">Ver detalhes</button>
        <button class="btn-small btn-primary" data-id="${pedidoId}" onclick="repetirPedido(event)">Repetir</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(listEl);
}

/* Exibe modal com itens do pedido, buscando /pedidoproduto/:pedidoId */
async function verDetalhesPedido(event) {
  const btn = event.currentTarget;
  const pedidoId = btn.getAttribute('data-id');
  openPedidoModal(pedidoId);
}

async function openPedidoModal(pedidoId) {
  const modal = document.getElementById('pedidoModal');
  const title = document.getElementById('modalPedidoTitle');
  const body = document.getElementById('modalPedidoBody');
  title.textContent = `Pedido #${pedidoId}`;
  body.innerHTML = `<p>Carregando itens...</p>`;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden','false');

  try {
    const resp = await fetch(`${API_BASE_URL}/pedidoproduto/${pedidoId}`);
    if (!resp.ok) throw new Error('Não foi possível carregar os itens');
    const itens = await resp.json();

    if (!Array.isArray(itens)) {
      // às vezes vem como objeto com rows
      itens = itens.rows || (itens.data || []);
    }

    if (!itens || itens.length === 0) {
      body.innerHTML = '<p>Nenhum item encontrado para este pedido.</p>';
      return;
    }

    // monta tabela
    let html = `<table class="table-itens" aria-label="Itens do pedido">
      <thead><tr><th>Produto</th><th>Qtd</th><th>Preço unit.</th><th>Subtotal</th></tr></thead><tbody>`;
    itens.forEach(it => {
      const nome = it.nome_produto || it.nome || it.descricao || `Produto ${it.id_produto || it.id}`;
      const qtd = it.quantidade || it.qtd || 1;
      const preco = it.preco_unitario || it.preco || it.preco_unit || 0;
      const subtotal = (Number(preco) * Number(qtd)) || 0;
      html += `<tr>
        <td>${escapeHtml(nome)}</td>
        <td>${qtd}</td>
        <td>${formatarMoeda(preco)}</td>
        <td>${formatarMoeda(subtotal)}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    body.innerHTML = html;
  } catch (err) {
    console.error(err);
    body.innerHTML = `<p>Erro ao carregar itens: ${err.message}</p>`;
  }

  // fechar bind
  const closeBtn = document.getElementById('closePedidoModal');
  closeBtn.onclick = closePedidoModal;
}

function closePedidoModal() {
  const modal = document.getElementById('pedidoModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden','true');
  document.getElementById('modalPedidoBody').innerHTML = '';
}

/* Repetir pedido: coloca itens no carrinho (localStorage) e redireciona ao carrinho */
async function repetirPedido(event) {
  const btn = event.currentTarget;
  const pedidoId = btn.getAttribute('data-id');

  try {
    const resp = await fetch(`${API_BASE_URL}/pedidoproduto/${pedidoId}`);
    if (!resp.ok) throw new Error('Não foi possível recuperar itens do pedido');
    let itens = await resp.json();
    if (!Array.isArray(itens)) itens = itens.rows || itens.data || [];

    // transformar itens no formato do carrinho (id_produto, nome_produto, quantidade, preco)
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    itens.forEach(it => {
      carrinho.push({
        id_produto: it.id_produto,
        nome_produto: it.nome_produto || it.nome,
        quantidade: Number(it.quantidade) || 1,
        preco: Number(it.preco_unitario || it.preco || it.preco_unit) || 0
      });
    });
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    // redireciona ao carrinho
    window.location.href = '../carrinho/carrinho.html';
  } catch (err) {
    console.error(err);
    showMessage(`Erro ao repetir pedido: ${err.message}`, 'error');
  }
}

/* util: simples escape */
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

/* mensagens simples (usadas no repetirPedido erro) */
function showMessage(text, type = 'info') {
  const container = document.getElementById('messageContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `message ${type}`;
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// expose functions used in markup buttons
window.verDetalhesPedido = verDetalhesPedido;
window.repetirPedido = repetirPedido;
window.closePedidoModal = closePedidoModal;