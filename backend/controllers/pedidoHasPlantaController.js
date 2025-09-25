const { query } = require('../database');

// Listar todos os relacionamentos pedido/planta
exports.listarPedidoHasPlanta = async (req, res) => {
  try {
    const result = await query(
      `SELECT php.id_pedido, php.id_planta, php.quantidade, php.preco_planta,
              p.data_pedido, pl.nome_popular
         FROM Pedido_has_Planta php
         JOIN Pedido p ON php.id_pedido = p.id_pedido
         JOIN Planta pl ON php.id_planta = pl.id_planta
         ORDER BY php.id_pedido, php.id_planta`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar Pedido_has_Planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar item por id_pedido e id_planta
exports.obterPedidoHasPlanta = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);
    const id_planta = parseInt(req.params.id_planta);

    if (isNaN(id_pedido) || isNaN(id_planta)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    const result = await query(
      `SELECT php.id_pedido, php.id_planta, php.quantidade, php.preco_planta,
              p.data_pedido, pl.nome_popular
         FROM Pedido_has_Planta php
         JOIN Pedido p ON php.id_pedido = p.id_pedido
         JOIN Planta pl ON php.id_planta = pl.id_planta
        WHERE php.id_pedido = $1 AND php.id_planta = $2`,
      [id_pedido, id_planta]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter Pedido_has_Planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo relacionamento pedido/planta
exports.criarPedidoHasPlanta = async (req, res) => {
  try {
    const { id_pedido, id_planta, quantidade, preco_planta } = req.body;

    if (!id_pedido || !id_planta || !quantidade || !preco_planta) {
      return res.status(400).json({
        error: 'id_pedido, id_planta, quantidade e preco_planta são obrigatórios'
      });
    }

    // Verifica se Pedido existe
    const pedidoResult = await query('SELECT * FROM Pedido WHERE id_pedido = $1', [id_pedido]);
    if (pedidoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Pedido não cadastrado' });
    }

    // Verifica se Planta existe
    const plantaResult = await query('SELECT * FROM Planta WHERE id_planta = $1', [id_planta]);
    if (plantaResult.rows.length === 0) {
      return res.status(400).json({ error: 'Planta não cadastrada' });
    }

    // Verifica se relação já existe
    const relResult = await query(
      'SELECT * FROM Pedido_has_Planta WHERE id_pedido = $1 AND id_planta = $2',
      [id_pedido, id_planta]
    );
    if (relResult.rows.length > 0) {
      return res.status(400).json({ error: 'Relação já cadastrada' });
    }

    const result = await query(
      'INSERT INTO Pedido_has_Planta (id_pedido, id_planta, quantidade, preco_planta) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_pedido, id_planta, quantidade, preco_planta]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar Pedido_has_Planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar relacionamento pedido/planta existente
exports.atualizarPedidoHasPlanta = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);
    const id_planta = parseInt(req.params.id_planta);
    const { quantidade, preco_planta } = req.body;

    if (isNaN(id_pedido) || isNaN(id_planta)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    // Verifica se relação existe
    const existing = await query(
      'SELECT * FROM Pedido_has_Planta WHERE id_pedido = $1 AND id_planta = $2',
      [id_pedido, id_planta]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    const atual = existing.rows[0];

    const updatedFields = {
      quantidade: quantidade !== undefined ? quantidade : atual.quantidade,
      preco_planta: preco_planta !== undefined ? preco_planta : atual.preco_planta
    };

    const result = await query(
      'UPDATE Pedido_has_Planta SET quantidade = $1, preco_planta = $2 WHERE id_pedido = $3 AND id_planta = $4 RETURNING *',
      [
        updatedFields.quantidade,
        updatedFields.preco_planta,
        id_pedido,
        id_planta
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar Pedido_has_Planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar relacionamento pedido/planta
exports.deletarPedidoHasPlanta = async (req, res) => {
  try {
    const id_pedido = parseInt(req.params.id_pedido);
    const id_planta = parseInt(req.params.id_planta);

    if (isNaN(id_pedido) || isNaN(id_planta)) {
      return res.status(400).json({ error: 'IDs devem ser números válidos' });
    }

    // Verifica se existe
    const existing = await query(
      'SELECT * FROM Pedido_has_Planta WHERE id_pedido = $1 AND id_planta = $2',
      [id_pedido, id_planta]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    await query('DELETE FROM Pedido_has_Planta WHERE id_pedido = $1 AND id_planta = $2', [id_pedido, id_planta]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar Pedido_has_Planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};