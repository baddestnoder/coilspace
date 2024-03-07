const router = require("express").Router();

const generateCoilController = require("./generateCoilController.js");










router.get("/generateCoil", generateCoilController.getGenerateCoil);
router.post("/generateCoil", generateCoilController.postGenerateCoil);








module.exports = router;