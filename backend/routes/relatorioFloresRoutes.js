const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioFloresController');

// Rota: mês com mais flores vendidas
router.get('/mes-mais-vendas', relatorioController.mesMaisVendas);

// Rota: flores mais vendidas
router.get('/flores-mais-vendidas', relatorioController.floresMaisVendidas);

// Rota: todos os meses (para gráfico)
router.get('/todos-os-meses', relatorioController.todosOsMeses);

module.exports = router;