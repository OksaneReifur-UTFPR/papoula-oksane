const db = require('../database'); // ajuste o caminho se seu database.js não estiver na raiz
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_chave_em_producao';
const SALT_ROUNDS = 10;

// Verifica se o email_pessoa existe (usado antes de criação ou login)
exports.verificarEmail = async (req, res) => {
  try {
    const { email_pessoa } = req.body;
    if (!email_pessoa) return res.status(400).json({ error: 'email_pessoa é obrigatório' });

    const query = 'SELECT cpf_pessoa, nome_pessoa, email_pessoa FROM pessoa WHERE email_pessoa = $1 LIMIT 1';
    const result = await db.pool.query(query, [email_pessoa]);

    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }

    return res.json({ exists: true, user: result.rows[0] });
  } catch (err) {
    console.error('verificarEmail error:', err);
    return res.status(500).json({ error: 'Erro ao verificar email_pessoa' });
  }
};

// Verifica senha_pessoa e gera token JWT quando ok
exports.verificarSenha = async (req, res) => {
  try {
    console.log(req.body)
    const { email_pessoa, senha_pessoa } = req.body;
    if (!email_pessoa || !senha_pessoa) return res.status(400).json({ error: 'email_pessoa e senha_pessoa são obrigatórios' });

    const query = 'SELECT cpf_pessoa, nome_pessoa, email_pessoa, senha_pessoa FROM pessoa WHERE email_pessoa = $1 LIMIT 1';
    const result = await db.pool.query(query, [email_pessoa]);

    if (result.rows.length === 0) {
      return res.status(401).json({ auth: false, message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(senha_pessoa, user.senha_pessoa);

    if (!match) {
      return res.status(401).json({ auth: false, message: 'Credenciais inválidas' });
    }

    // Gera token JWT
    const payload = { id: user.cpf_pessoa, email_pessoa: user.email_pessoa, nome_pessoa: user.nome_pessoa };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Não retornar a senha_pessoa
    delete user.senha_pessoa;

    return res.json({ auth: true, token, user: { id: user.cpf_pessoa, nome_pessoa: user.nome_pessoa, email_pessoa: user.email_pessoa } });
  } catch (err) {
    console.error('verificarSenha error:', err);
    return res.status(500).json({ error: 'Erro ao verificar senha_pessoa' });
  }
};

// Verifica se token JWT é válido (pode ser chamada para manter sessão)
exports.verificaSeUsuarioEstaLogado = async (req, res) => {
  try {
    // aceita token no header Authorization: Bearer <token> ou no body.token
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token) token = req.body && req.body.token;

    if (!token) return res.status(401).json({ auth: false, message: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ auth: false, message: 'Token inválido' });
      return res.json({ auth: true, user: decoded });
    });
  } catch (err) {
    console.error('verificaSeUsuarioEstaLogado error:', err);
    return res.status(500).json({ error: 'Erro ao verificar autenticação' });
  }
};

// Lista pessoas (sem senha_pessoa)
exports.listarPessoas = async (req, res) => {
  try {
    const query = 'SELECT cpf_pessoa, nome_pessoa, email_pessoa FROM pessoa ORDER BY cpf_pessoa';
    const result = await db.pool.query(query);
    return res.json(result.rows);
  } catch (err) {
    console.error('listarPessoas error:', err);
    return res.status(500).json({ error: 'Erro ao listar pessoas' });
  }
};

// Cria uma nova pessoa (hash da senha_pessoa)
exports.criarPessoa = async (req, res) => {
  try {
    const { nome_pessoa, email_pessoa, senha_pessoa } = req.body;
    if (!nome_pessoa || !email_pessoa || !senha_pessoa) return res.status(400).json({ error: 'nome_pessoa, email_pessoa e senha_pessoa são obrigatórios' });

    // Verifica se email_pessoa já existe
    const check = await db.pool.query('SELECT cpf_pessoa FROM pessoa WHERE email_pessoa = $1 LIMIT 1', [email_pessoa]);
    if (check.rows.length > 0) return res.status(409).json({ error: 'Email já cadastrado' });

    const hashed = await bcrypt.hash(senha_pessoa, SALT_ROUNDS);

    const insertQuery = `
      INSERT INTO pessoa (nome_pessoa, email_pessoa, senha_pessoa)
      VALUES ($1, $2, $3)
      RETURNING cpf_pessoa, nome_pessoa, email_pessoa
    `;

    const result = await db.pool.query(insertQuery, [nome_pessoa, email_pessoa, hashed]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('criarPessoa error:', err);
    return res.status(500).json({ error: 'Erro ao criar pessoa' });
  }
};

// Retorna uma pessoa por id (sem senha_pessoa)
exports.obterPessoa = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT cpf_pessoa, nome_pessoa, email_pessoa FROM pessoa WHERE cpf_pessoa = $1 LIMIT 1';
    const result = await db.pool.query(query, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('obterPessoa error:', err);
    return res.status(500).json({ error: 'Erro ao obter pessoa' });
  }
};