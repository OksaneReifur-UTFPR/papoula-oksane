const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

// Listar todos os funcionários
router.get('/', funcionarioController.listarFuncionarios);

// Buscar funcionário por CPF
router.get('/:cpf', funcionarioController.obterFuncionario);

// Inserir novo funcionário
router.post('/', funcionarioController.criarFuncionario);

// Atualizar funcionário existente
router.put('/:cpf', funcionarioController.atualizarFuncionario);

// Deletar funcionário
router.delete('/:cpf', funcionarioController.deletarFuncionario);

module.exports = router;