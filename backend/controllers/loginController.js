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

// Verifica senha_pessoa, identifica o cargo e gera token JWT quando ok
exports.verificarSenha = async (req, res) => {
  try {
    console.log(req.body);
    const { email_pessoa, senha_pessoa } = req.body;
    if (!email_pessoa || !senha_pessoa) return res.status(400).json({ error: 'email_pessoa e senha_pessoa são obrigatórios' });

    // Query para buscar pessoa, senha_pessoa, e determinar o cargo/role (Gerente/Outro Funcionário/Cliente)
    const query = `
      SELECT 
        p.cpf_pessoa, 
        p.nome_pessoa, 
        p.email_pessoa, 
        p.senha_pessoa,
        c.nome_cargo,
        f.id_cargo
      FROM 
        pessoa p
      LEFT JOIN 
        funcionario f ON p.cpf_pessoa = f.cpf_pessoa
      LEFT JOIN 
        cargo c ON f.id_cargo = c.id_cargo
      WHERE 
        p.email_pessoa = $1
      LIMIT 1;
    `;
    const result = await db.pool.query(query, [email_pessoa]); 

    if (result.rows.length === 0) {
      return res.status(401).json({ auth: false, message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(senha_pessoa, user.senha_pessoa);

    if (!match) {
      return res.status(401).json({ auth: false, message: 'Credenciais inválidas' });
    }

    // Determinar o papel (role) do usuário
    // Regra: Se for funcionário, usa o cargo. Se não for, é Cliente (garantido pelo cadastro).
    let role = 'Cliente';
    if (user.id_cargo) {
      // Remove espaços em branco do nome do cargo, se houver.
      role = user.nome_cargo ? user.nome_cargo.trim() : 'Funcionário'; 
    }

    // Gera token JWT com o papel do usuário
    const payload = { 
        id: user.cpf_pessoa, 
        email_pessoa: user.email_pessoa, 
        nome_pessoa: user.nome_pessoa,
        role: role 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Não retornar a senha_pessoa
    delete user.senha_pessoa;

    return res.json({ 
        auth: true, 
        token, 
        user: { 
            id: user.cpf_pessoa, 
            nome_pessoa: user.nome_pessoa, 
            email_pessoa: user.email_pessoa,
            role: role // Retornar o papel para o frontend
        } 
    });
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

/// Cria uma nova pessoa (hash da senha_pessoa) e a registra como cliente
exports.criarPessoa = async (req, res) => {
  const { cpf_pessoa, nome_pessoa, data_nascimento_pessoa, email_pessoa, senha_pessoa } = req.body;
  
  if (!cpf_pessoa || !nome_pessoa || !data_nascimento_pessoa || !email_pessoa || !senha_pessoa) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios para o cadastro.' });
  }

  // Validação básica do CPF
  if (cpf_pessoa.length !== 11 || !/^\d+$/.test(cpf_pessoa)) {
     return res.status(400).json({ error: 'O CPF deve conter exatamente 11 dígitos numéricos.' });
  }

  try {
    // 1. Verificar se CPF ou Email já existem
    const checkQuery = 'SELECT 1 FROM pessoa WHERE cpf_pessoa = $1 OR email_pessoa = $2 LIMIT 1';
    // Uso da função db.query que você definiu no database.js
    const checkResult = await db.query(checkQuery, [cpf_pessoa, email_pessoa]); 
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'CPF ou Email já cadastrado.' });
    }

    const hashed = await bcrypt.hash(senha_pessoa, SALT_ROUNDS);
    // Data de cadastro é a data atual para a tabela cliente
    const dataCadastro = new Date().toISOString().split('T')[0]; 

    // Uso de transação para garantir que a pessoa e o cliente sejam inseridos juntos
    const resultTransaction = await db.transaction(async (client) => {
      // 2. Inserir na tabela pessoa
      const insertPessoaQuery = `
        INSERT INTO pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa, email_pessoa, senha_pessoa)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING cpf_pessoa, nome_pessoa, email_pessoa
      `;
      const pessoaResult = await client.query(insertPessoaQuery, [cpf_pessoa, nome_pessoa, data_nascimento_pessoa, email_pessoa, hashed]);
      const novaPessoa = pessoaResult.rows[0];

      // 3. Inserir automaticamente como cliente (Regra de Negócio)
      const insertClienteQuery = `
        INSERT INTO cliente (cpf_cliente, data_cadastro)
        VALUES ($1, $2)
      `;
      await client.query(insertClienteQuery, [cpf_pessoa, dataCadastro]);
      
      return { ...novaPessoa, role: 'Cliente', message: 'Cadastro realizado com sucesso!' };
    });
    
    return res.status(201).json(resultTransaction);

  } catch (err) {
    console.error('criarPessoa error:', err);
    return res.status(500).json({ error: 'Erro ao criar pessoa e registrar como cliente.' });
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