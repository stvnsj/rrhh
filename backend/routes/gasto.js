
var express = require('express');
var router = express.Router();
const gasto_controller = require("../controllers/gastoController");



/*==============================
*
*     DELETE METHODS 
*
*===============================*/
router.route("/bono/delete/:id").delete(gasto_controller.deleteBono);
router.route("/descuento/delete/:id").delete(gasto_controller.deleteDescuento);
router.route("/anticipo/delete/:id").delete(gasto_controller.deleteAnticipo);
router.route("/traslado/delete/:id").delete(gasto_controller.deleteTraslado);


/*============================
 *
 *  POST METHODS
 * 
 =============================*/
router.route("/bono").post(gasto_controller.createBono);
router.route("/anticipo").post(gasto_controller.createAnticipo);
router.route("/descuento").post(gasto_controller.createDescuento);
router.route("/traslado").post(gasto_controller.createTraslado);


/*===========================
 *
 *   GET METHODS
 *    
 =============================*/
router.route("/bono").get(gasto_controller.getAllBonos);
router.route("/anticipo").get(gasto_controller.getAllAnticipos);
router.route("/descuento").get(gasto_controller.getAllDescuentos);
router.route("/traslado").get(gasto_controller.getAllTraslados);


router.route("/bono/historial").get(gasto_controller.bonoHistory);
router.route("/anticipo/historial").get(gasto_controller.anticipoHistory);
router.route("/descuento/historial").get(gasto_controller.descuentoHistory);




router.route("/bono/trabajador/:empleado_id").get(gasto_controller.getBonoEmpleado)
router.route("/descuento/trabajador/:empleado_id").get(gasto_controller.getDescuentoEmpleado)
router.route("/anticipo/trabajador/:empleado_id").get(gasto_controller.getAnticipoEmpleado)

router.route("/bono/empleado/:empleado_id/proyecto/:proyecto_id").get(gasto_controller.getAllBonos);
router.route("/anticipo/empleado/:empleado_id/proyecto/:proyecto_id").get(gasto_controller.getAllAnticipos);
router.route("/descuento/empleado/:empleado_id/proyecto/:proyecto_id").get(gasto_controller.getAllDescuentos);
router.route("/traslado/empleado/:empleado_id/proyecto/:proyecto_id").get(gasto_controller.getAllTraslados);

router.route("/bono/empleado/:empleado_id").get(gasto_controller.getAllBonos);
router.route("/anticipo/empleado/:empleado_id").get(gasto_controller.getAllAnticipos);
router.route("/descuento/empleado/:empleado_id").get(gasto_controller.getAllDescuentos);
router.route("/traslado/empleado/:empleado_id").get(gasto_controller.getAllTraslados);

router.route("/bono/proyecto/:proyecto_id").get(gasto_controller.getAllBonos);
router.route("/anticipo/proyecto/:proyecto_id").get(gasto_controller.getAllAnticipos);
router.route("/descuento/proyecto/:proyecto_id").get(gasto_controller.getAllDescuentos);
router.route("/traslado/proyecto/:proyecto_id").get(gasto_controller.getAllTraslados);




/********************
 * PUT METHODS
 ********************/
router.route("/bono/edit").put(gasto_controller.editBono);
router.route("/anticipo/edit").put(gasto_controller.editAnticipo);
router.route("/descuento/edit").put(gasto_controller.editDescuento);




module.exports = router;
