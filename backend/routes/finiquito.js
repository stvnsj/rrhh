
var express = require('express');
var router = express.Router();

// const previred_controller = require("../controllers/previredController");

const finiquito_service    = require("../services/finiquitoService");
const finiquito_controller = require("../controllers/finiquitoController");


router.route("/finiquito/download/:year/:month").get(finiquito_service.getMonth);
router.route("/finiquito/:year/:month").get(finiquito_controller.getMonth);



module.exports = router;
