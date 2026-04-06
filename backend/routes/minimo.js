var express = require('express');
var router = express.Router();

const minimo_controller = require("../controllers/minimoController");


/*=====================================
 *
 *         GET METHODS
 * 
 *=====================================*/

// Get all empleados in EQC
router.route("/minimo").get(minimo_controller.getAll);


/*=================================
 *
 *         POST METHODS
 *
 *=================================*/

// Create a new sueldo minimo
router.route("/minimo").post(minimo_controller.create);






module.exports = router;