var express = require('express');
var router = express.Router();
const contrato_controller = require("../controllers/contratoController");


/********************
 * GET METHODS
 ********************/

router.route("/contrato/options/:id").get(contrato_controller.options)
router.route("/contrato").get(contrato_controller.getContrato);
router.route("/contrato/not").get(contrato_controller.getNotContrato);
router.route("/contrato/unpaid").get(contrato_controller.getUnpaid);
router.route("/contrato/old").get(contrato_controller.getOld);
router.route("/contrato/profile/:id").get(contrato_controller.getProfile);
router.route("/contrato/empleado/:id").get(contrato_controller.getEmpleadoContrato);


/********************
 * POST METHODS
 ********************/

router.route("/contrato").post(contrato_controller.create);
router.route("/contrato/anexo").post(contrato_controller.crear_anexo);
router.route("/contrato/actualizar").post(contrato_controller.actualizar);


router.route("/contrato/cerrado").post(contrato_controller.terminated);
router.route("/contrato/nuevo").post(contrato_controller.create_new);



/********************
 * PUT METHODS
 ********************/
router.route("/contrato/undo").put(contrato_controller.undoTerminateContrato);
router.route("/contrato/edit").put(contrato_controller.edit);
router.route("/contrato/terminate").put(contrato_controller.terminateContrato);
router.route("/contrato/pay/:contrato_id/:finiquito/:proyecto_id").put(contrato_controller.payContrato);
router.route("/contrato/safe-edit-fire").put(contrato_controller.safe_edit_fire);



router.route("/contrato/safe-edit-start").put(contrato_controller.safe_edit_start);
router.route("/contrato/safe-edit-end").put(contrato_controller.safe_edit_end);
router.route("/contrato/edit_finiquito").put(contrato_controller.edit_finiquito);


// terminateContrato

/************************
 *    DELETE METHODS 
 ************************/


/* Export Module */
module.exports = router;
