// auth.js — Módulo de autenticação

const API_BASE_URL = 'http://localhost:3000';

export async function login(email, senha) {
  try {
    const res = await fetch(`${API_BASE_URL}/login/verificarSenha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_pessoa: email, senha_pessoa: senha })
    });
    
    const data = await res.json();
    
    if (data.auth) {
      // Armazena o token
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      sessionStorage.setItem('userId', data.user.id);
    }
    
    return data;
  } catch (err) {
    console.error('Erro no login:', err);
    throw err;
  }
}

export async function registrar(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/login/criarPessoa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (data.role === 'Cliente') {
      // Auto-login após cadastro
      localStorage.setItem('usuario', JSON.stringify(data));
      sessionStorage.setItem('userId', data.cpf_pessoa);
    }
    
    return data;
  } catch (err) {
    console.error('Erro no cadastro:', err);
    throw err;
  }
}

export function mostrarMensagem(container, texto, tipo) {
  if (!container) return;
  
  if (tipo === 'limpar') {
    container.textContent = '';
    container.className = '';
    return;
  }
  
  container.textContent = texto;
  container.className = `message message-${tipo}`;
  
  if (tipo === 'sucesso' || tipo === 'erro') {
    setTimeout(() => {
      container.textContent = '';
      container.className = '';
    }, 5000);
  }
}