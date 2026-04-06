

var express = require('express');
var router = express.Router();
const plot_controller = require("../controllers/plotController");





/*==================================
 *        _____ ______ _______ 
 *       / ____|  ____|__   __|
 *      | |  __| |__     | |   
 *      | | |_ |  __|    | |   
 *      | |__| | |____   | |   
 *       \_____|______|  |_|   
 *
 *==================================*/



router.route("/plot/boleta/day/date1/:y1/:m1/:d1/date2/:y2/:m2/:d2/delta/:delta").get(plot_controller.boletaDay);
router.route("/plot/global/day/date1/:y1/:m1/:d1/date2/:y2/:m2/:d2/delta/:delta").get(plot_controller.globalDay);
router.route("/plot/proyecto/day/date1/:y1/:m1/:d1/date2/:y2/:m2/:d2/delta/:delta/id/:proyecto_id").get(plot_controller.proyectoDay);

// Plots costs from proyecto from initial to final day.
router.route("/plot/proyecto/date1/:y1/:m1/:d1/date2/:y2/:m2/:d2/id/:proyecto_id").get(plot_controller.costo_day)


// 







module.exports = router;