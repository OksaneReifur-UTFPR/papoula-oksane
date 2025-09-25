const express = require('express');
const router = express.Router();
const cargoController = require('../controllers/cargoController');

// Listar todos os cargos
router.get('/', cargoController.listarCargos);

// Buscar cargo por ID
router.get('/:id', cargoController.obterCargo);

// Inserir novo cargo
router.post('/', cargoController.criarCargo);

// Atualizar cargo existente
router.put('/:id', cargoController.atualizarCargo);

// Deletar cargo
router.delete('/:id', cargoController.deletarCargo);

module.exports = router;