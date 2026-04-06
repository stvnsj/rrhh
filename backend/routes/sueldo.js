

var express = require('express');
var router = express.Router();
const sueldo_controller = require("../controllers/sueldoController");
const banco_service = require("../services/bancoService");



/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*==================================*/

router.route("/sueldo/:year/:month").get(sueldo_controller.sueldos);
router.route("/sueldo/banco/:year/:month").get(banco_service.excel);



/*==================================
*   _____   ____   _____ _______ 
*  |  __ \ / __ \ / ____|__   __|
*  | |__) | |  | | (___    | |   
*  |  ___/| |  | |\___ \   | |   
*  | |    | |__| |____) |  | |   
*  |_|     \____/|_____/   |_|   
*==================================*/

router.route("/sueldo/create/multiple").post(sueldo_controller.insertMultiple);
router.route("/sueldo/create/single").post(sueldo_controller.insertSingle);





/*==================================
*       _____  _    _ _______ 
*      |  __ \| |  | |__   __|
*      | |__) | |  | |  | |   
*      |  ___/| |  | |  | |   
*      | |    | |__| |  | |   
*      |_|     \____/   |_|    
*==================================*/


module.exports = router;