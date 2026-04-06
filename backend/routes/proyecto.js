
var express = require('express');
var router = express.Router();
const proyecto_controller = require("../controllers/proyectoController");
const presupuesto_controller = require("../controllers/presupuestoController");
const maintenance_controller = require("../controllers/maintenanceController");

const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/presupuesto')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})

/*==================================
 *   _____   ____   _____ _______ 
 *  |  __ \ / __ \ / ____|__   __|
 *  | |__) | |  | | (___    | |   
 *  |  ___/| |  | |\___ \   | |   
 *  | |    | |__| |____) |  | |   
 *  |_|     \____/|_____/   |_|   
 *
 *==================================*/


/* Create a proyecto on table 'proyectos' */
router.route("/proyecto").post(proyecto_controller.create);

/* Insert an Empleado to Proyecto */
router.route("/proyecto/addEmpleado").post(proyecto_controller.addEmpleado);

/* Upload a presupuesto */
router.route("/proyecto/presupuesto/upload").post(upload.single("avatar"),presupuesto_controller.upload);





/*==================================
 *        _____ ______ _______ 
 *       / ____|  ____|__   __|
 *      | |  __| |__     | |   
 *      | | |_ |  __|    | |   
 *      | |__| | |____   | |   
 *       \_____|______|  |_|   
 *
 *==================================*/

// Get Presupuesto of Proyecto
router.route("/proyecto/presupuesto/get/:proyecto_id").get(presupuesto_controller.getPresupuesto);


/* Get Full 'proyectos' table */
router.route("/proyecto").get(proyecto_controller.getAll);

/* Get all empleados in proyecto with <id> */
router.route("/proyecto/empleados/:id").get(proyecto_controller.getEmpleados);

/* Get all empleados NOT in proyecto with <id> */
router.route("/proyecto/empleados/complement/:id/:filtro").get(proyecto_controller.getEmpleadosComplement);

/* Get all empleados with asistencia on proyecto(id,fecha)  */
router.route("/proyecto/empleados/asistencia/:proyecto_id/:year/:month/:day").get(proyecto_controller.getEmpleadosAsistencia);

/*"Get monthly report of proyecto"*/
router.route("/proyecto/report/id/:proyecto_id/year/:year/month/:month")
.get(proyecto_controller.getReport);

router.route("/proyecto/options").get(proyecto_controller.get);


router.route("/proyecto/pwdb").get(maintenance_controller.exportJSON);


/*==================================
 *       _____  _    _ _______ 
 *      |  __ \| |  | |__   __|
 *      | |__) | |  | |  | |   
 *      |  ___/| |  | |  | |   
 *      | |    | |__| |  | |   
 *      |_|     \____/   |_|   
 *
 *==================================*/

router.route("/proyecto/edit").put(proyecto_controller.updateProyecto);





/*=====================================================
*     _____  ______ _      ______ _______ ______ 
*    |  __ \|  ____| |    |  ____|__   __|  ____|
*    | |  | | |__  | |    | |__     | |  | |__   
*    | |  | |  __| | |    |  __|    | |  |  __|  
*    | |__| | |____| |____| |____   | |  | |____ 
*    |_____/|______|______|______|  |_|  |______|
*
*=======================================================*/

// Delete empleado from proyecto
router.route("/proyecto/delete/proyectoid/:proyecto_id/empleadoid/:empleado_id").delete(proyecto_controller.deleteEmpleado);

// 




module.exports = router;
