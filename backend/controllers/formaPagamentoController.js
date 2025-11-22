const { query } = require('../database');

// Listar todas as formas de pagamento
exports.listarFormasPagamento = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM Forma_pagamento ORDER BY id_formaDePagamento'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar formas de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar forma de pagamento por ID
exports.obterFormaPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM Forma_pagamento WHERE id_formaDePagamento = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir nova forma de pagamento
exports.criarFormaPagamento = async (req, res) => {
  console.log((req))
  try {
    const { nome_formaDePagamento } = req.body;

    if (!nome_formaDePagamento) {
      return res.status(400).json({
        error: 'nome_formaDePagamento é obrigatório'
      });
    }

    const result = await query(
      'INSERT INTO Forma_pagamento (nome_formaDePagamento) VALUES ($1) RETURNING *',
      [nome_formaDePagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar forma de pagamento existente
exports.atualizarFormaPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_formaDePagamento } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query(
      'SELECT * FROM Forma_pagamento WHERE id_formaDePagamento = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    const result = await query(
      'UPDATE Forma_pagamento SET nome_formaDePagamento = $1 WHERE id_formaDePagamento = $2 RETURNING *',
      [nome_formaDePagamento !== undefined ? nome_formaDePagamento : existing.rows[0].nome_formaDePagamento, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar forma de pagamento
exports.deletarFormaPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query(
      'SELECT * FROM Forma_pagamento WHERE id_formaDePagamento = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    await query(
      'DELETE FROM Forma_pagamento WHERE id_formaDePagamento = $1',
      [id]
    );
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};