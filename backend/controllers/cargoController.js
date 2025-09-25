const { query } = require('../database');

// Listar todos os cargos
exports.listarCargos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM Cargo ORDER BY id_cargo');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar cargo por ID
exports.obterCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM Cargo WHERE id_cargo = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo cargo
exports.criarCargo = async (req, res) => {
  try {
    const { id_cargo, nome_cargo } = req.body;

    if (!id_cargo || !nome_cargo) {
      return res.status(400).json({
        error: 'id_cargo e nome_cargo são obrigatórios'
      });
    }

    const result = await query(
      'INSERT INTO Cargo (id_cargo, nome_cargo) VALUES ($1, $2) RETURNING *',
      [id_cargo, nome_cargo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cargo:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'ID de cargo já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar cargo existente
exports.atualizarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_cargo } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Busca cargo existente
    const existing = await query('SELECT * FROM Cargo WHERE id_cargo = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    const cargoAtual = existing.rows[0];

    const updatedFields = {
      nome_cargo: nome_cargo !== undefined ? nome_cargo : cargoAtual.nome_cargo
    };

    const result = await query(
      'UPDATE Cargo SET nome_cargo = $1 WHERE id_cargo = $2 RETURNING *',
      [
        updatedFields.nome_cargo,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar cargo
exports.deletarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM Cargo WHERE id_cargo = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    await query('DELETE FROM Cargo WHERE id_cargo = $1', [id]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};