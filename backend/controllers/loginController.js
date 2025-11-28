const db = require('../database'); // ajuste o caminho se seu database.js não estiver na raiz
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_chave_em_producao';
const SALT_ROUNDS = 10;

// Verifica se o email existe (usado antes de criação ou login)
exports.verificarEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email é obrigatório' });

    const query = 'SELECT id_pessoa, nome, email FROM pessoa WHERE email = $1 LIMIT 1';
    const result = await db.pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }

    return res.json({ exists: true, user: result.rows[0] });
  } catch (err) {
    console.error('verificarEmail error:', err);
    return res.status(500).json({ error: 'Erro ao verificar email' });
  }
};

// Verifica senha e gera token JWT quando ok
exports.verificarSenha = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'email e senha são obrigatórios' });

    const query = 'SELECT id_pessoa, nome, email, senha FROM pessoa WHERE email = $1 LIMIT 1';
    const result = await db.pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ auth: false, message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(senha, user.senha);

    if (!match) {
      return res.status(401).json({ auth: false, message: 'Credenciais inválidas' });
    }

    // Gera token JWT
    const payload = { id: user.id_pessoa, email: user.email, nome: user.nome };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Não retornar a senha
    delete user.senha;

    return res.json({ auth: true, token, user: { id: user.id_pessoa, nome: user.nome, email: user.email } });
  } catch (err) {
    console.error('verificarSenha error:', err);
    return res.status(500).json({ error: 'Erro ao verificar senha' });
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

// Lista pessoas (sem senha)
exports.listarPessoas = async (req, res) => {
  try {
    const query = 'SELECT id_pessoa, nome, email FROM pessoa ORDER BY id_pessoa';
    const result = await db.pool.query(query);
    return res.json(result.rows);
  } catch (err) {
    console.error('listarPessoas error:', err);
    return res.status(500).json({ error: 'Erro ao listar pessoas' });
  }
};

// Cria uma nova pessoa (hash da senha)
exports.criarPessoa = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });

    // Verifica se email já existe
    const check = await db.pool.query('SELECT id_pessoa FROM pessoa WHERE email = $1 LIMIT 1', [email]);
    if (check.rows.length > 0) return res.status(409).json({ error: 'Email já cadastrado' });

    const hashed = await bcrypt.hash(senha, SALT_ROUNDS);

    const insertQuery = `
      INSERT INTO pessoa (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING id_pessoa, nome, email
    `;

    const result = await db.pool.query(insertQuery, [nome, email, hashed]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('criarPessoa error:', err);
    return res.status(500).json({ error: 'Erro ao criar pessoa' });
  }
};

// Retorna uma pessoa por id (sem senha)
exports.obterPessoa = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT id_pessoa, nome, email FROM pessoa WHERE id_pessoa = $1 LIMIT 1';
    const result = await db.pool.query(query, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('obterPessoa error:', err);
    return res.status(500).json({ error: 'Erro ao obter pessoa' });
  }
};