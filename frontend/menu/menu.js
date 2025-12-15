// ===================================================
// ARQUIVO: menu.js (Atualizado para nova navegação)
// ===================================================

// --- LÓGICA DE CORAÇÕES FLUTUANTES (Mantida) ---

/**
 * Cria os corações flutuantes e laterais para o efeito visual unificado.
 */
function createHearts() {
  const floating = document.querySelector('.floating-hearts');
  const side = document.querySelector('.side-hearts');
  const heartEmojis = ['💗', '💕', '💞', '💖'];

  if(!floating || !side) return; // Garante que os containers existam

  // Limpa containers
  floating.innerHTML = '';
  side.innerHTML = '';


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
  floatHearts.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `heart heart-${i+1}`;
    heart.innerHTML = heartEmojis[i % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    floating.appendChild(heart);
  });


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
  rightPositions.forEach((pos, i) => {
    const heart = document.createElement('span');
    heart.className = `side-heart right-${i+1}`;
    heart.innerHTML = heartEmojis[(i+1) % heartEmojis.length];
    Object.assign(heart.style, pos);
    heart.style.animationDelay = pos.delay;
    side.appendChild(heart);
  });
}

// --- LÓGICA DE GERENCIAMENTO (Atualizada) ---

function isManagerLoggedIn() {
  const role = (localStorage.getItem('userRole') || localStorage.getItem('role') || '').toLowerCase();
  const username = (localStorage.getItem('username') || localStorage.getItem('user') || '').toLowerCase();
  const usuarioString = localStorage.getItem('usuario');

  // Verifica o objeto 'usuario' que é o padrão que vínhamos usando
  if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      if (usuario && (usuario.tipo === 'gerente' || usuario.role === 'gerente')) {
          return true;
      }
  }

  // Verifica as chaves mais antigas, se o objeto 'usuario' não for encontrado
  if (role) {
    return role === 'gerente' || role === 'manager' || role === 'admin';
  }
  if (username) {
    return username.startsWith('gerente'); 
  }
  return false;
}

// Mostra ou esconde o item de menu de gerenciamento.
function showManagerButtonIfNeeded() {
  // O item 'Gerenciar' (botão com ícone, visível só para gerente)
  const el = document.getElementById('manager-menu-item');
  // O item 'Gerenciamento' (link padrão que substitui 'Produtos')
  const elVisible = document.getElementById('manager-menu-item-visible'); 

  if (!el || !elVisible) return;
  
  if (isManagerLoggedIn()) {
    // Se for gerente: mostra o botão 'Gerenciar' e esconde o link 'Gerenciamento'.
    el.style.display = 'list-item'; 
    elVisible.style.display = 'none';
  } else {
    // Se não for gerente: esconde o botão 'Gerenciar' e mostra o link 'Gerenciamento'.
    el.style.display = 'none';
    elVisible.style.display = 'list-item';
  }
}

// Função para atualizar o contador de carrinho (para o menu ficar completo)
function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
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


// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', function () {
  createHearts();
  showManagerButtonIfNeeded();
  atualizarContadorCarrinho();
});