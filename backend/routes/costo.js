
var express = require('express');
var router = express.Router();
const costo_controller = require('../controllers/costoController');
const costo_service    = require('../services/costoService');
const downloadXlsx     = require('../controllers/downloadXlsx');
const multer = require('multer')
var upload = multer({ dest: "uploads" })



// Descarga de TEMPLATE
// router.route("/costo/template/...").costo


router.route("/costo/report").post(costo_controller.report);
router.route("/costo/reportxlsx").post(downloadXlsx.report_xlsx)


/* GET ROUTES */ 
router.route("/costo/summary/year/:year/month/:month")
    .get(costo_controller.summary);
router.route("/costo/full/:date1/:date2/:option")
    .get(costo_controller.fullCosto);
router.route("/costo/personal/:date0/:date1")
    .get(costo_service.costo_personal);

router.route("/costo/proyecto/boleta/:option/:proyecto_id")
    .get(costo_controller.boletasProyecto);
router.route("/costo/proyecto/factura/:option/:proyecto_id")
    .get(costo_controller.facturasProyecto);
router.route("/costo/proyecto/transferencia/:option/:proyecto_id")
    .get(costo_controller.transferenciasProyecto);
router.route("/costo/proyecto/full/:option/:proyecto_id")
    .get(costo_controller.costosProyecto);


/* PUT ROUTES */
router.route("/costo/edit").put(costo_controller.edit);

/* DELETE ROUTES */
router.route("/costo/delete/:documento/:id")
    .delete(costo_controller.delete);







module.exports = router;



