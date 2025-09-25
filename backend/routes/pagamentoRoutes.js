const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// Listar todos os pagamentos
router.get('/', pagamentoController.listarPagamentos);

// Buscar pagamento por ID
router.get('/:id', pagamentoController.obterPagamento);

// Inserir novo pagamento
router.post('/', pagamentoController.criarPagamento);

// Atualizar pagamento existente
router.put('/:id', pagamentoController.atualizarPagamento);

// Deletar pagamento
router.delete('/:id', pagamentoController.deletarPagamento);

module.exports = router;