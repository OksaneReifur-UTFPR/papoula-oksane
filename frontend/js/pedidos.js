window.addEventListener('DOMContentLoaded', function() {
  const lista = document.getElementById('pedidos-lista');
  const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

  if (pedidos.length === 0) {
    lista.innerHTML = "<p>Você ainda não fez nenhum pedido 💗</p>";
    return;
  }

  let html = '<h2>Seus pedidos</h2>';
  pedidos.forEach(item => {
    html += `
      <div class="pedido-item">
        <p><strong>${item.nome}</strong></p>
        <small>Adicionado em: ${item.data}</small>
      </div>
    `;
  });

  lista.innerHTML = html;
});
