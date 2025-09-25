const express = require('express');
const router = express.Router();
const plantaController = require('../controllers/plantaController');

// Listar todas as plantas
router.get('/', plantaController.listarPlantas);

// Buscar planta por ID
router.get('/:id', plantaController.obterPlanta);

// Inserir nova planta
router.post('/', plantaController.criarPlanta);

// Atualizar planta existente
router.put('/:id', plantaController.atualizarPlanta);

// Deletar planta
router.delete('/:id', plantaController.deletarPlanta);

module.exports = router;