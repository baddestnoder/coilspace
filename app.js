const express = require("express");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoose = require("mongoose");


require("dotenv").config();


const landing = require("./workspace/landing.js");
const register = require("./workspace/register/registerRouter.js");
const login = require("./workspace/login.js");
const main = require("./workspace/main.js");
const buyCoil = require("./workspace/buyCoil.js");
const investment = require("./workspace/investment/investmentRouter.js");
const about = require("./workspace/about.js");
const learn = require("./workspace/learn.js");
const coil = require("./workspace/coil.js");
const coilCard = require("./workspace/coilCard.js");
const deposit = require("./workspace/deposit.js");
const generate = require("./workspace/generateCoil/generateCoilRouter.js");
const withdraw = require("./workspace/withdraw.js");
const director = require("./workspace/director/directorController.js");
const shareCoil = require("./workspace/shareCoil.js");
const agent = require("./workspace/agent.js");
const history = require("./workspace/history/historyRouter.js");
const refer = require("./workspace//refer.js");
const agentPage = require("./workspace/agentPage.js");







const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(compression());


app.use(landing);
app.use(register);
app.use(login);
app.use(main);
app.use(buyCoil);
app.use(investment);
app.use(about);
app.use(learn);
app.use(coil);
app.use(coilCard);
app.use(deposit);
app.use(generate);
app.use(withdraw);
app.use(director);
app.use(shareCoil);
app.use(agent);
app.use(history);
app.use(refer);
app.use(agentPage);





const port = process.env.PORT || 9000;

mongoose.connect("mongodb+srv://doleefUser:BASSEYER@doleefcluster.brp5c.mongodb.net/Doleef_database", 
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	}
).then((result)=>{
	app.listen(port, ()=>{
		if(port === 9000){
			console.log("Listening");
		}
	});
}).catch((error)=>{
	if(port === 9000){
		console.log(error)
	}
});
