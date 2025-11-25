const express = require('express');
const router = express.Router();
const formaPagamentoController = require('../controllers/formaPagamentoController');


router.get('/abrirCrudFormaDePagamento', formaPagamentoController.abrirCrudFormaDePagamento);

// Listar todas as formas de pagamento
router.get('/', formaPagamentoController.listarFormasPagamento);

// Buscar forma de pagamento por ID
router.get('/:id', formaPagamentoController.obterFormaPagamento);

// Inserir nova forma de pagamento
router.post('/', formaPagamentoController.criarFormaPagamento);

// Atualizar forma de pagamento existente
router.put('/:id', formaPagamentoController.atualizarFormaPagamento);

// Deletar forma de pagamento
router.delete('/:id', formaPagamentoController.deletarFormaPagamento);

module.exports = router;