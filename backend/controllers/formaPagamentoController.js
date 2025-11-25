const { query } = require('../database');

// Listar todas as formas de pagamento

/*
CREATE TABLE public.forma_pagamento (
	id_formadepagamento serial4 NOT NULL,
	nome_formadepagamento varchar(50) NOT NULL,
	CONSTRAINT forma_pagamento_pkey PRIMARY KEY (id_formadepagamento)
);

*/


exports.listarFormasPagamento = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM forma_pagamento ORDER BY id_formadepagamento'
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
      'SELECT * FROM forma_pagamento WHERE id_formadepagamento = $1',
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
    const {id_formadepagamento, nome_formadepagamento } = req.body;

    if (!nome_formadepagamento) {
      return res.status(400).json({
        error: 'nome_formadepagamento é obrigatório'
      });
    }

    const result = await query(
      'INSERT INTO forma_pagamento (id_formadepagamento, nome_formadepagamento) VALUES ($1,$2) RETURNING *',
      [id_formadepagamento, nome_formadepagamento]
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
    const { nome_formadepagamento } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query(
      'SELECT * FROM forma_pagamento WHERE id_formadepagamento = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    const result = await query(
      'UPDATE forma_pagamento SET nome_formadepagamento = $1 WHERE id_formadepagamento = $2 RETURNING *',
      [nome_formadepagamento !== undefined ? nome_formadepagamento : existing.rows[0].nome_formadepagamento, id]
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
      'SELECT * FROM forma_pagamento WHERE id_formadepagamento = $1',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Forma de pagamento não encontrada' });
    }

    await query(
      'DELETE FROM forma_pagamento WHERE id_formadepagamento = $1',
      [id]
    );
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar forma de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};