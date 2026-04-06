var express = require('express');
var router = express.Router();

const empleado_controller = require("../controllers/empleadoController");



/*=====================================
 *
 *         POST METHODS
 * 
 *=====================================*/

router.route("/empleado").post(empleado_controller.create);


/*=====================================
 *
 *         GET METHODS
 * 
 *=====================================*/

// Get all empleados in EQC
router.route("/empleado").get(empleado_controller.getAll);
router.route("/empleado/list").get(empleado_controller.getList);
router.route("/empleado/:id").get(empleado_controller.getProfile);

// Get all (active) proyectos of a given empleado
router.route("/empleado/:id/proyectos/").get(empleado_controller.getProyectos);



/*=====================================
 *
 *         PUT METHODS
 * 
 *=====================================*/

// Update a field of empleado
router.route("/empleado/edit").put(empleado_controller.updateEmpleado);



module.exports = router;
