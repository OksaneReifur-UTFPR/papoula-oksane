const express = require('express');
const router = express.Router();
const pagamentoHasFormaDePagamentoController = require('../controllers/pagamentoHasFormaDePagamentoController');

// Listar todos os relacionamentos pagamento/forma de pagamento
router.get('/', pagamentoHasFormaDePagamentoController.listarPagamentoHasFormaDePagamento);

// Buscar relacionamento por id_pagamentoPedido e id_formaDePagamento
router.get('/:id_pagamentoPedido/:id_formaDePagamento', pagamentoHasFormaDePagamentoController.obterPagamentoHasFormaDePagamento);

// Inserir novo relacionamento
router.post('/', pagamentoHasFormaDePagamentoController.criarPagamentoHasFormaDePagamento);

// Atualizar relacionamento existente
router.put('/:id_pagamentoPedido/:id_formaDePagamento', pagamentoHasFormaDePagamentoController.atualizarPagamentoHasFormaDePagamento);

// Deletar relacionamento
router.delete('/:id_pagamentoPedido/:id_formaDePagamento', pagamentoHasFormaDePagamentoController.deletarPagamentoHasFormaDePagamento);

module.exports = router;