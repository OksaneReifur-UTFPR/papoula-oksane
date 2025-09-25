const { query } = require('../database');

// Listar todos os pedidos
exports.listarPedidos = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id_pedido, p.cpf_cliente, p.data_pedido, c.data_cadastro
         FROM Pedido p
         JOIN Cliente c ON p.cpf_cliente = c.cpf_cliente
         ORDER BY p.id_pedido`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar pedido por ID
exports.obterPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      `SELECT p.id_pedido, p.cpf_cliente, p.data_pedido, c.data_cadastro
         FROM Pedido p
         JOIN Cliente c ON p.cpf_cliente = c.cpf_cliente
        WHERE p.id_pedido = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo pedido
exports.criarPedido = async (req, res) => {
  try {
    const { cpf_cliente, data_pedido } = req.body;

    if (!cpf_cliente || !data_pedido) {
      return res.status(400).json({
        error: 'cpf_cliente e data_pedido são obrigatórios'
      });
    }
    if (cpf_cliente.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se Cliente existe
    const clienteResult = await query(
      'SELECT * FROM Cliente WHERE cpf_cliente = $1',
      [cpf_cliente]
    );
    if (clienteResult.rows.length === 0) {
      return res.status(400).json({ error: 'CPF não cadastrado como Cliente' });
    }

    const result = await query(
      'INSERT INTO Pedido (cpf_cliente, data_pedido) VALUES ($1, $2) RETURNING *',
      [cpf_cliente, data_pedido]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar pedido existente
exports.atualizarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { cpf_cliente, data_pedido } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se pedido existe
    const existing = await query('SELECT * FROM Pedido WHERE id_pedido = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Se for atualizar o cliente, verificar existência
    let clienteValido = true;
    if (cpf_cliente !== undefined) {
      if (cpf_cliente.length !== 11) {
        return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
      }
      const clienteResult = await query('SELECT * FROM Cliente WHERE cpf_cliente = $1', [cpf_cliente]);
      if (clienteResult.rows.length === 0) {
        clienteValido = false;
      }
    }
    if (cpf_cliente !== undefined && !clienteValido) {
      return res.status(400).json({ error: 'CPF não cadastrado como Cliente' });
    }

    const pedidoAtual = existing.rows[0];

    const updatedFields = {
      cpf_cliente: cpf_cliente !== undefined ? cpf_cliente : pedidoAtual.cpf_cliente,
      data_pedido: data_pedido !== undefined ? data_pedido : pedidoAtual.data_pedido
    };

    const result = await query(
      'UPDATE Pedido SET cpf_cliente = $1, data_pedido = $2 WHERE id_pedido = $3 RETURNING *',
      [
        updatedFields.cpf_cliente,
        updatedFields.data_pedido,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pedido
exports.deletarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM Pedido WHERE id_pedido = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    await query('DELETE FROM Pedido WHERE id_pedido = $1', [id]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};