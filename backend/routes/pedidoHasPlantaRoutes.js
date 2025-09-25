const express = require('express');
const router = express.Router();
const pedidoHasPlantaController = require('../controllers/pedidoHasPlantaController');

// Listar todos os relacionamentos pedido/planta
router.get('/', pedidoHasPlantaController.listarPedidoHasPlanta);

// Buscar relacionamento por id_pedido e id_planta
router.get('/:id_pedido/:id_planta', pedidoHasPlantaController.obterPedidoHasPlanta);

// Inserir novo relacionamento
router.post('/', pedidoHasPlantaController.criarPedidoHasPlanta);

// Atualizar relacionamento existente
router.put('/:id_pedido/:id_planta', pedidoHasPlantaController.atualizarPedidoHasPlanta);

// Deletar relacionamento
router.delete('/:id_pedido/:id_planta', pedidoHasPlantaController.deletarPedidoHasPlanta);

module.exports = router;