

var express = require('express');
var router = express.Router();
const asistencia_controller = require("../controllers/asistenciaController");
const asistencia_service    = require("../services/asistenciaService")


/****************
* POST ROUTES
******************/


router
    .route("/asistencia/proyecto/:proyectoid/fecha/:fecha")
    .get(asistencia_controller.get_asistencia_proyecto)


router
    .route("/asistencia/registro")
    .post(asistencia_controller.registrar_asistencia)


/* Create a proyecto on table 'proyectos' */
router.route("/asistencia").post(asistencia_controller.insert);
router.route("/asistencia/all").post(asistencia_controller.insertAll);


router.route("/asistencia/import-json").post(asistencia_controller.importJSON);



/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/

router.route('/asistencia/reporte/:year/:month/:day').get(asistencia_controller.report);
router.route('/asistencia/export/:year/:month').get(asistencia_service.monthlyAsistencia);
router.route('/asistencia/resumen/:year/:month').get(asistencia_service.lista_asistentes);
router.route('/asistencia/generate-json/:id').get(asistencia_controller.exportJSON);


module.exports = router;
