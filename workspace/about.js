const router = require("express").Router();








router.get("/about", (req, res)=>{
	res.render("about.ejs");
});





module.exports = router;