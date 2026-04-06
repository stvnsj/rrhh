var express = require('express');
var router = express.Router();
const social_controller = require("../controllers/socialController");

/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/

router.route("/social/:year/:month").get(social_controller.social);
router.route("/social/get").get(social_controller.get)






/*==================================
*   _____   ____   _____ _______ 
*  |  __ \ / __ \ / ____|__   __|
*  | |__) | |  | | (___    | |   
*  |  ___/| |  | |\___ \   | |   
*  | |    | |__| |____) |  | |   
*  |_|     \____/|_____/   |_|   
*
*==================================*/

router.route("/social/create").post(social_controller.create);


router.route("/social/new").post(social_controller.new)












module.exports = router;