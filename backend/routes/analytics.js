
let express = require('express');
let router = express.Router();
const analytics_controller = require("../controllers/analyticsController");
const analytics_service = require("../services/analyticsService");
const download_xlsx = require("../controllers/downloadXlsx")

/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/


// Xport GUI
router.route("/analytics/resumen-anual/:anno").get(download_xlsx.resumen_anual_xlsx)
router.route("/analytics/xxx").get(analytics_service.xxx);
router.route("/analytics/category/:proyecto_id/:categoria_id").get(analytics_controller.categoria);
router.route("/analytics/:proyecto_id").get(analytics_controller.general);



// Xport Routes
router.route("/analytics/excel/:proyecto_id").get(analytics_controller.xport);




module.exports = router;
