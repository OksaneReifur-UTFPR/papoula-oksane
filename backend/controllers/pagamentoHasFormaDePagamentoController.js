const { query } = require('../database');

// Listar todos os relacionamentos pagamento/forma de pagamento
exports.listarPagamentoHasFormaDePagamento = async (req, res) => {
  try {
    const result = await query(
      `SELECT phf.id_pagamentoPedido, phf.id_formaDePagamento, phf.valor_pago,
              p.data_pagamento, f.nome_formaDePagamento
         FROM Pagamento_has_FormaDePagamento phf
         JOIN Pagamento p ON phf.id_pagamentoPedido = p.id_pagamento
         JOIN Forma_pagamento f ON phf.id_formaDePagamento = f.id_formaDePagamento
         ORDER BY phf.id_pagamentoPedido, phf.id_formaDePagamento`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar Pagamento_has_FormaDePagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar relacionamento por id_pagamentoPedido e id_formaDePagamento
exports.obterPagamentoHasFormaDePagamento = async (req, res) => {
  try {
    const id_pagamentoPedido = parseInt(req.params.id_pagamentoPedido);
    const id_formaDePagamento = parseInt(req.params.id_formaDePagamento);

    if (isNaN(id_pagamentoPedido) || isNaN(id_formaDePagamento)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    const result = await query(
      `SELECT phf.id_pagamentoPedido, phf.id_formaDePagamento, phf.valor_pago,
              p.data_pagamento, f.nome_formaDePagamento
         FROM Pagamento_has_FormaDePagamento phf
         JOIN Pagamento p ON phf.id_pagamentoPedido = p.id_pagamento
         JOIN Forma_pagamento f ON phf.id_formaDePagamento = f.id_formaDePagamento
        WHERE phf.id_pagamentoPedido = $1 AND phf.id_formaDePagamento = $2`,
      [id_pagamentoPedido, id_formaDePagamento]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter Pagamento_has_FormaDePagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo relacionamento pagamento/forma de pagamento
exports.criarPagamentoHasFormaDePagamento = async (req, res) => {
  try {
    const { id_pagamentoPedido, id_formaDePagamento, valor_pago } = req.body;

    if (!id_pagamentoPedido || !id_formaDePagamento || !valor_pago) {
      return res.status(400).json({
        error: 'id_pagamentoPedido, id_formaDePagamento e valor_pago são obrigatórios'
      });
    }

    // Verifica se Pagamento existe
    const pagamentoResult = await query('SELECT * FROM Pagamento WHERE id_pagamento = $1', [id_pagamentoPedido]);
    if (pagamentoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Pagamento não cadastrado' });
    }

    // Verifica se Forma de Pagamento existe
    const formaResult = await query('SELECT * FROM Forma_pagamento WHERE id_formaDePagamento = $1', [id_formaDePagamento]);
    if (formaResult.rows.length === 0) {
      return res.status(400).json({ error: 'Forma de pagamento não cadastrada' });
    }

    // Verifica se relação já existe
    const relResult = await query(
      'SELECT * FROM Pagamento_has_FormaDePagamento WHERE id_pagamentoPedido = $1 AND id_formaDePagamento = $2',
      [id_pagamentoPedido, id_formaDePagamento]
    );
    if (relResult.rows.length > 0) {
      return res.status(400).json({ error: 'Relação já cadastrada' });
    }

    const result = await query(
      'INSERT INTO Pagamento_has_FormaDePagamento (id_pagamentoPedido, id_formaDePagamento, valor_pago) VALUES ($1, $2, $3) RETURNING *',
      [id_pagamentoPedido, id_formaDePagamento, valor_pago]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar Pagamento_has_FormaDePagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar relacionamento pagamento/forma de pagamento existente
exports.atualizarPagamentoHasFormaDePagamento = async (req, res) => {
  try {
    const id_pagamentoPedido = parseInt(req.params.id_pagamentoPedido);
    const id_formaDePagamento = parseInt(req.params.id_formaDePagamento);
    const { valor_pago } = req.body;

    if (isNaN(id_pagamentoPedido) || isNaN(id_formaDePagamento)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    // Verifica se relação existe
    const existing = await query(
      'SELECT * FROM Pagamento_has_FormaDePagamento WHERE id_pagamentoPedido = $1 AND id_formaDePagamento = $2',
      [id_pagamentoPedido, id_formaDePagamento]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    const atual = existing.rows[0];

    const result = await query(
      'UPDATE Pagamento_has_FormaDePagamento SET valor_pago = $1 WHERE id_pagamentoPedido = $2 AND id_formaDePagamento = $3 RETURNING *',
      [
        valor_pago !== undefined ? valor_pago : atual.valor_pago,
        id_pagamentoPedido,
        id_formaDePagamento
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar Pagamento_has_FormaDePagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar relacionamento pagamento/forma de pagamento
exports.deletarPagamentoHasFormaDePagamento = async (req, res) => {
  try {
    const id_pagamentoPedido = parseInt(req.params.id_pagamentoPedido);
    const id_formaDePagamento = parseInt(req.params.id_formaDePagamento);

    if (isNaN(id_pagamentoPedido) || isNaN(id_formaDePagamento)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    // Verifica se existe
    const existing = await query(
      'SELECT * FROM Pagamento_has_FormaDePagamento WHERE id_pagamentoPedido = $1 AND id_formaDePagamento = $2',
      [id_pagamentoPedido, id_formaDePagamento]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    await query('DELETE FROM Pagamento_has_FormaDePagamento WHERE id_pagamentoPedido = $1 AND id_formaDePagamento = $2', [id_pagamentoPedido, id_formaDePagamento]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar Pagamento_has_FormaDePagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};