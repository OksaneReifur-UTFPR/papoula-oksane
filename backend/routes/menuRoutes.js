const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

//necessario para evitar problemas de CORS

router.get('/', menuController.abrirMenu);


module.exports = router;
