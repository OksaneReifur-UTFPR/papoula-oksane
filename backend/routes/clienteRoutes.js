const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Listar todos os clientes
router.get('/', clienteController.listarClientes);

// Buscar cliente por CPF
router.get('/:cpf', clienteController.obterCliente);

// Inserir novo cliente
router.post('/', clienteController.criarCliente);

// Atualizar cliente existente
router.put('/:cpf', clienteController.atualizarCliente);

// Deletar cliente
router.delete('/:cpf', clienteController.deletarCliente);

module.exports = router;