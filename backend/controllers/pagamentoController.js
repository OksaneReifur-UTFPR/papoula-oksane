const { query } = require('../database');

// Listar todos os pagamentos
exports.listarPagamentos = async (req, res) => {
  try {
    const result = await query(
      `SELECT pa.id_pagamento, pa.id_pedido, pa.data_pagamento, pa.valor_total_pagamento,
              pe.cpf_cliente, pe.data_pedido
         FROM Pagamento pa
         JOIN Pedido pe ON pa.id_pedido = pe.id_pedido
         ORDER BY pa.id_pagamento`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar pagamento por ID
exports.obterPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      `SELECT pa.id_pagamento, pa.id_pedido, pa.data_pagamento, pa.valor_total_pagamento,
              pe.cpf_cliente, pe.data_pedido
         FROM Pagamento pa
         JOIN Pedido pe ON pa.id_pedido = pe.id_pedido
        WHERE pa.id_pagamento = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo pagamento
exports.criarPagamento = async (req, res) => {
  try {
    const { id_pedido, data_pagamento, valor_total_pagamento } = req.body;

    if (!id_pedido || !data_pagamento || !valor_total_pagamento) {
      return res.status(400).json({
        error: 'id_pedido, data_pagamento e valor_total_pagamento são obrigatórios'
      });
    }

    // Verifica se Pedido existe
    const pedidoResult = await query('SELECT * FROM Pedido WHERE id_pedido = $1', [id_pedido]);
    if (pedidoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Pedido não cadastrado' });
    }

    const result = await query(
      'INSERT INTO Pagamento (id_pedido, data_pagamento, valor_total_pagamento) VALUES ($1, $2, $3) RETURNING *',
      [id_pedido, data_pagamento, valor_total_pagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar pagamento existente
exports.atualizarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_pedido, data_pagamento, valor_total_pagamento } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se pagamento existe
    const existing = await query('SELECT * FROM Pagamento WHERE id_pagamento = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Se for atualizar o pedido, verificar existência
    let pedidoValido = true;
    if (id_pedido !== undefined) {
      const pedidoResult = await query('SELECT * FROM Pedido WHERE id_pedido = $1', [id_pedido]);
      if (pedidoResult.rows.length === 0) {
        pedidoValido = false;
      }
    }
    if (id_pedido !== undefined && !pedidoValido) {
      return res.status(400).json({ error: 'Pedido não cadastrado' });
    }

    const pagamentoAtual = existing.rows[0];

    const updatedFields = {
      id_pedido: id_pedido !== undefined ? id_pedido : pagamentoAtual.id_pedido,
      data_pagamento: data_pagamento !== undefined ? data_pagamento : pagamentoAtual.data_pagamento,
      valor_total_pagamento: valor_total_pagamento !== undefined ? valor_total_pagamento : pagamentoAtual.valor_total_pagamento
    };

    const result = await query(
      'UPDATE Pagamento SET id_pedido = $1, data_pagamento = $2, valor_total_pagamento = $3 WHERE id_pagamento = $4 RETURNING *',
      [
        updatedFields.id_pedido,
        updatedFields.data_pagamento,
        updatedFields.valor_total_pagamento,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pagamento
exports.deletarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM Pagamento WHERE id_pagamento = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    await query('DELETE FROM Pagamento WHERE id_pagamento = $1', [id]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};