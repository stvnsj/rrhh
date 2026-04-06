
var express = require('express');
var router = express.Router();
const empresa_controller = require('../controllers/empresaController');




router.route("/empresa/report/year/:year/month/:month").get(empresa_controller.getReport);





















module.exports = router;