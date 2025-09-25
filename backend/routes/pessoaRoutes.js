const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');

// Listar todas as pessoas
router.get('/', pessoaController.listarPessoas);

// Buscar pessoa por CPF
router.get('/:cpf', pessoaController.obterPessoa);

// Inserir nova pessoa
router.post('/', pessoaController.criarPessoa);

// Atualizar pessoa existente
router.put('/:cpf', pessoaController.atualizarPessoa);

// Deletar pessoa
router.delete('/:cpf', pessoaController.deletarPessoa);

module.exports = router;