// Exemplo simples de manipulação do seletor de usuário
function handleUserAction(value) {
  if (value === "gerenciar-conta") {
    alert("Funcionalidade de gerenciamento de conta ainda não implementada.");
  }
  if (value === "sair") {
    alert("Logout simulado!");
    // Aqui você pode limpar dados de sessão/localStorage se for implementar login
    window.location.href = "../html/menu.html";
  }
}