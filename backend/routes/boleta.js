var express = require('express');
var router = express.Router();
const boleta_controller = require('../controllers/boletaController');
const boleta_service    = require('../services/boletaService')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/boletas')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})

/* POST ROUTES */
router.route("/boleta/upload")
    .post(upload.single("avatar"),boleta_controller.upload);
router.route("/boleta/create")
    .post(boleta_controller.create);

/* GET ROUTES */
router.route("/boleta/year/:year/month/:month")
    .get(boleta_controller.getMonth);
router.route("/boleta/xport/:year")
    .get(boleta_service.boletaExport);
router.route("/boleta/detalle/:date1/:date2/:option")
    .get(boleta_service.boletaDetail);

module.exports = router;
