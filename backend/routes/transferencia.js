
var express = require('express');
var router = express.Router();
const transferencia_controller = require('../controllers/transferenciaController');
const transferencia_service    = require('../services/transferenciaService');
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/transferencias')
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

router.route("/transferencia/upload").post(upload.single("avatar"),transferencia_controller.upload);
router.route("/transferencia/create").post(transferencia_controller.create);





/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/

router.route("/transferencia/year/:year/month/:month").get(transferencia_controller.getMonth);
router.route("/transferencia/xport/:year").get(transferencia_service.transferenciaExport);
router.route("/transferencia/detalle/:date1/:date2/:option").get(transferencia_service.transferenciaDetail);




module.exports = router;
