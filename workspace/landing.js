const express = require("express");


const router = express.Router();




router.get("/", async(req, res)=>{
	res.redirect(301, "/landing")
});




router.get("/landing", async(req, res)=>{
	res.render("landing.ejs");
});











module.exports = router;