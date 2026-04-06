
var express = require('express');
var router = express.Router();
const previred_controller = require("../controllers/previredController");
const previred_service = require("../services/previredService");



/*=======FULL PREVIRED=======*/
router.route("/previred/:year/:month").get(previred_controller.previred);
router.route("/previredFile/:year/:month").get(previred_service.foo);

/*=========ABRIDGED PREVIRED==========*/
router.route("/previred/abridged/:year/:month").get(previred_controller.previredAbridged);
router.route("/previredFile/abridged/:year/:month").get(previred_service.fooAbridged);






module.exports = router;
