const { query } = require('../database');

// Listar todos os clientes
exports.listarClientes = async (req, res) => {
  try {
    const result = await query(
      `SELECT c.cpf_cliente, c.data_cadastro, p.nome_pessoa, p.data_nascimento_pessoa
         FROM Cliente c
         JOIN Pessoa p ON c.cpf_cliente = p.cpf_pessoa
         ORDER BY c.cpf_cliente`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar cliente por CPF
exports.obterCliente = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    const result = await query(
      `SELECT c.cpf_cliente, c.data_cadastro, p.nome_pessoa, p.data_nascimento_pessoa
         FROM Cliente c
         JOIN Pessoa p ON c.cpf_cliente = p.cpf_pessoa
        WHERE c.cpf_cliente = $1`,
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo cliente
exports.criarCliente = async (req, res) => {
  try {
    const { cpf_cliente, data_cadastro } = req.body;

    if (!cpf_cliente || !data_cadastro) {
      return res.status(400).json({
        error: 'cpf_cliente e data_cadastro são obrigatórios'
      });
    }
    if (cpf_cliente.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se CPF existe em Pessoa
    const pessoaResult = await query(
      'SELECT * FROM Pessoa WHERE cpf_pessoa = $1',
      [cpf_cliente]
    );
    if (pessoaResult.rows.length === 0) {
      return res.status(400).json({ error: 'CPF não cadastrado em Pessoa' });
    }

    // Verifica se já existe Cliente
    const clienteResult = await query(
      'SELECT * FROM Cliente WHERE cpf_cliente = $1',
      [cpf_cliente]
    );
    if (clienteResult.rows.length > 0) {
      return res.status(400).json({ error: 'Cliente já cadastrado' });
    }

    const result = await query(
      'INSERT INTO Cliente (cpf_cliente, data_cadastro) VALUES ($1, $2) RETURNING *',
      [cpf_cliente, data_cadastro]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar cliente existente
exports.atualizarCliente = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    const { data_cadastro } = req.body;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se cliente existe
    const existing = await query('SELECT * FROM Cliente WHERE cpf_cliente = $1', [cpf]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Atualiza apenas data_cadastro (único campo possível)
    const result = await query(
      'UPDATE Cliente SET data_cadastro = $1 WHERE cpf_cliente = $2 RETURNING *',
      [
        data_cadastro !== undefined ? data_cadastro : existing.rows[0].data_cadastro,
        cpf
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar cliente
exports.deletarCliente = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM Cliente WHERE cpf_cliente = $1', [cpf]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await query('DELETE FROM Cliente WHERE cpf_cliente = $1', [cpf]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};