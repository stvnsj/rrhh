var express = require('express');
var router = express.Router();
const factura_controller = require('../controllers/facturaController');
const factura_service    = require('../services/facturaService');
const uploadXlsx         = require('../controllers/uploadXlsx');
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/facturas')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})



/* DISK storage for old routes */
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/facturas');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadDisk = multer({
  storage: diskStorage
});

/* MEMORY storage for new route */
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // example: 20 MB
    files: 2
  }
});




/*==================================
 *   _____   ____   _____ _______ 
 *  |  __ \ / __ \ / ____|__   __|
 *  | |__) | |  | | (___    | |   
 *  |  ___/| |  | |\___ \   | |   
 *  | |    | |__| |____) |  | |   
 *  |_|     \____/|_____/   |_|   
 *
 *==================================*/
router.route("/factura/compare").post(upload.single("avatar"),uploadXlsx.compare);
router.route("/factura/upload").post(upload.single("avatar"),factura_controller.upload);
router.route("/factura/create").post(factura_controller.create);


// router.route("/ingreso/factura/upload").post(upload.single("avatar"),factura_controller.upload);
router.route("/ingreso/factura/create").post(factura_controller.eqc_create);
router.route("/ingreso/factura/upload").post(upload.single("avatar"),factura_controller.eqc_upload);


router.route("/factura/upload-sii").post(

  uploadMemory.fields([
    { name: "facturas_eqc", maxCount: 1 },
    { name: "facturas_sii", maxCount: 1 },
  ]),

  factura_controller.cargar_facturas_sii

);



/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/
router.route("/factura/year/:year/month/:month").get(factura_controller.getMonth);
router.route("/factura/xport/:year").get(factura_service.facturaExport);
router.route("/factura/detalle/:date1/:date2/:option").get(factura_service.facturaDetail);


router.route("/ingreso/factura/year/:year/month/:month").get(factura_controller.getMonthEQC);
// router.route("/factura/xport/:year").get(factura_service.facturaExport);
// router.route("/factura/detalle/:date1/:date2/:option").get(factura_service.facturaDetail);

module.exports = router;
