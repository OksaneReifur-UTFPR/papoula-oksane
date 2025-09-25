const { query } = require('../database');

// Listar todas as pessoas
exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM Pessoa');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar pessoa por CPF
exports.obterPessoa = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    const result = await query(
      'SELECT * FROM Pessoa WHERE cpf_pessoa = $1',
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir nova pessoa
exports.criarPessoa = async (req, res) => {
  try {
    const { cpf_pessoa, nome_pessoa, data_nascimento_pessoa } = req.body;

    if (!cpf_pessoa || !nome_pessoa || !data_nascimento_pessoa) {
      return res.status(400).json({
        error: 'cpf_pessoa, nome_pessoa e data_nascimento_pessoa são obrigatórios'
      });
    }

    if (cpf_pessoa.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    const result = await query(
      'INSERT INTO Pessoa (cpf_pessoa, nome_pessoa, data_nascimento_pessoa) VALUES ($1, $2, $3) RETURNING *',
      [cpf_pessoa, nome_pessoa, data_nascimento_pessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar pessoa existente
exports.atualizarPessoa = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    const { nome_pessoa, data_nascimento_pessoa } = req.body;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Busca pessoa existente
    const existing = await query('SELECT * FROM Pessoa WHERE cpf_pessoa = $1', [cpf]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    const pessoaAtual = existing.rows[0];

    const updatedFields = {
      nome_pessoa: nome_pessoa !== undefined ? nome_pessoa : pessoaAtual.nome_pessoa,
      data_nascimento_pessoa: data_nascimento_pessoa !== undefined ? data_nascimento_pessoa : pessoaAtual.data_nascimento_pessoa,
    };

    const result = await query(
      'UPDATE Pessoa SET nome_pessoa = $1, data_nascimento_pessoa = $2 WHERE cpf_pessoa = $3 RETURNING *',
      [
        updatedFields.nome_pessoa,
        updatedFields.data_nascimento_pessoa,
        cpf
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pessoa
exports.deletarPessoa = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM Pessoa WHERE cpf_pessoa = $1', [cpf]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    await query('DELETE FROM Pessoa WHERE cpf_pessoa = $1', [cpf]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};