const router = require("express").Router();




router.get("/learn", (req, res)=>{
	res.render("learn.ejs")
});









module.exports = router;