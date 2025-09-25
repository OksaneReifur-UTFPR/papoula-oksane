const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Listar todos os pedidos
router.get('/', pedidoController.listarPedidos);

// Buscar pedido por ID
router.get('/:id', pedidoController.obterPedido);

// Inserir novo pedido
router.post('/', pedidoController.criarPedido);

// Atualizar pedido existente
router.put('/:id', pedidoController.atualizarPedido);

// Deletar pedido
router.delete('/:id', pedidoController.deletarPedido);

module.exports = router;