const { query } = require('../database');
const path = require('path');

// Listar todas as plantas
exports.listarPlantas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM planta');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar plantas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar planta por ID
exports.obterPlanta = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM planta WHERE id_planta = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Planta não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir nova planta
exports.criarPlanta = async (req, res) => {
  try {
    const { nome_popular, nome_cientifico, especie, descricao, preco_unitario, quantidade_estoque } = req.body;

    // Validação básica
    if (!nome_popular || !nome_cientifico || preco_unitario == null || quantidade_estoque == null) {
      return res.status(400).json({
        error: 'nome_popular, nome_cientifico, preco_unitario e quantidade_estoque são obrigatórios'
      });
    }

    const result = await query(
      'INSERT INTO planta (nome_popular, nome_cientifico, especie, descricao, preco_unitario, quantidade_estoque) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome_popular, nome_cientifico, especie, descricao, preco_unitario, quantidade_estoque]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar planta existente
exports.atualizarPlanta = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_popular, nome_cientifico, especie, descricao, preco_unitario, quantidade_estoque } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Busca planta existente
    const existing = await query('SELECT * FROM planta WHERE id_planta = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Planta não encontrada' });
    }

    // Usa os valores enviados ou mantém os antigos se não enviados
    const plantaAtual = existing.rows[0];

    const updatedFields = {
      nome_popular: nome_popular !== undefined ? nome_popular : plantaAtual.nome_popular,
      nome_cientifico: nome_cientifico !== undefined ? nome_cientifico : plantaAtual.nome_cientifico,
      especie: especie !== undefined ? especie : plantaAtual.especie,
      descricao: descricao !== undefined ? descricao : plantaAtual.descricao,
      preco_unitario: preco_unitario !== undefined ? preco_unitario : plantaAtual.preco_unitario,
      quantidade_estoque: quantidade_estoque !== undefined ? quantidade_estoque : plantaAtual.quantidade_estoque,
    };

    const result = await query(
      'UPDATE planta SET nome_popular = $1, nome_cientifico = $2, especie = $3, descricao = $4, preco_unitario = $5, quantidade_estoque = $6 WHERE id_planta = $7 RETURNING *',
      [
        updatedFields.nome_popular,
        updatedFields.nome_cientifico,
        updatedFields.especie,
        updatedFields.descricao,
        updatedFields.preco_unitario,
        updatedFields.quantidade_estoque,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar planta
exports.deletarPlanta = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM planta WHERE id_planta = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Planta não encontrada' });
    }

    await query('DELETE FROM planta WHERE id_planta = $1', [id]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar planta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};