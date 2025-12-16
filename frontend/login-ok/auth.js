// auth.js — ajuste na função login e registrar

export async function login(email, senha) {
  // ...código anterior...
  if (email === 'oksanegerente@gmail.com' && senha === '12345') {
    // Gerente
    return {
      auth: true,
      token: 'fake-token',
      user: { nome_pessoa: 'Gerente', email_pessoa: email, role: 'Gerente' }
    };
  } else {
    // Cliente
    return {
      auth: true,
      token: 'fake-token',
      user: { nome_pessoa: 'Cliente', email_pessoa: email, role: 'Cliente' }
    };
  }
}

export async function registrar(payload) {
  // ...código anterior...
  if (payload.email_pessoa === 'oksanegerente@gmail.com' && payload.senha_pessoa === '12345') {
    // Gerente
    return {
      role: 'Gerente',
      nome_pessoa: payload.nome_pessoa,
      email_pessoa: payload.email_pessoa
    };
  } else {
    // Cliente
    return {
      role: 'Cliente',
      nome_pessoa: payload.nome_pessoa,
      email_pessoa: payload.email_pessoa
    };
  }
}