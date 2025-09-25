const { query } = require('../database');

// Listar todos os funcionários
exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query(
      `SELECT f.cpf_pessoa, f.salario, f.id_cargo, c.nome_cargo, p.nome_pessoa, p.data_nascimento_pessoa
         FROM Funcionario f
         JOIN Pessoa p ON f.cpf_pessoa = p.cpf_pessoa
         JOIN Cargo c ON f.id_cargo = c.id_cargo
         ORDER BY f.cpf_pessoa`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Buscar funcionário por CPF
exports.obterFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    const result = await query(
      `SELECT f.cpf_pessoa, f.salario, f.id_cargo, c.nome_cargo, p.nome_pessoa, p.data_nascimento_pessoa
         FROM Funcionario f
         JOIN Pessoa p ON f.cpf_pessoa = p.cpf_pessoa
         JOIN Cargo c ON f.id_cargo = c.id_cargo
        WHERE f.cpf_pessoa = $1`,
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Inserir novo funcionário
exports.criarFuncionario = async (req, res) => {
  try {
    const { cpf_pessoa, salario, id_cargo } = req.body;

    if (!cpf_pessoa || !salario || !id_cargo) {
      return res.status(400).json({
        error: 'cpf_pessoa, salario e id_cargo são obrigatórios'
      });
    }
    if (cpf_pessoa.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se CPF existe em Pessoa
    const pessoaResult = await query(
      'SELECT * FROM Pessoa WHERE cpf_pessoa = $1',
      [cpf_pessoa]
    );
    if (pessoaResult.rows.length === 0) {
      return res.status(400).json({ error: 'CPF não cadastrado em Pessoa' });
    }

    // Verifica se cargo existe
    const cargoResult = await query(
      'SELECT * FROM Cargo WHERE id_cargo = $1',
      [id_cargo]
    );
    if (cargoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cargo não cadastrado' });
    }

    // Verifica se já existe Funcionário
    const funcionarioResult = await query(
      'SELECT * FROM Funcionario WHERE cpf_pessoa = $1',
      [cpf_pessoa]
    );
    if (funcionarioResult.rows.length > 0) {
      return res.status(400).json({ error: 'Funcionário já cadastrado' });
    }

    const result = await query(
      'INSERT INTO Funcionario (cpf_pessoa, salario, id_cargo) VALUES ($1, $2, $3) RETURNING *',
      [cpf_pessoa, salario, id_cargo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar funcionário existente
exports.atualizarFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;
    const { salario, id_cargo } = req.body;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se funcionário existe
    const existing = await query('SELECT * FROM Funcionario WHERE cpf_pessoa = $1', [cpf]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    // Se for atualizar o cargo, verifica se existe
    let cargoValido = true;
    if (id_cargo !== undefined) {
      const cargoResult = await query('SELECT * FROM Cargo WHERE id_cargo = $1', [id_cargo]);
      if (cargoResult.rows.length === 0) {
        cargoValido = false;
      }
    }
    if (id_cargo !== undefined && !cargoValido) {
      return res.status(400).json({ error: 'Cargo não cadastrado' });
    }

    const funcionarioAtual = existing.rows[0];

    const updatedFields = {
      salario: salario !== undefined ? salario : funcionarioAtual.salario,
      id_cargo: id_cargo !== undefined ? id_cargo : funcionarioAtual.id_cargo
    };

    const result = await query(
      'UPDATE Funcionario SET salario = $1, id_cargo = $2 WHERE cpf_pessoa = $3 RETURNING *',
      [
        updatedFields.salario,
        updatedFields.id_cargo,
        cpf
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar funcionário
exports.deletarFuncionario = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    if (!cpf || cpf.length !== 11) {
      return res.status(400).json({ error: 'CPF deve ter 11 dígitos' });
    }

    // Verifica se existe
    const existing = await query('SELECT * FROM Funcionario WHERE cpf_pessoa = $1', [cpf]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    await query('DELETE FROM Funcionario WHERE cpf_pessoa = $1', [cpf]);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};