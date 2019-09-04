//index.js script
console.log('hello, now commencing node................');

const express = require('express'); //import license
const app = express();
app.listen(3333, () => console.log('listening at Port 3333')); //server starts listening, 3333 port number.
app.use(express.static('publicDirectory')); //anything i put in publicDirectory will be publically hosted
app.use(express.json());
//JSON: javascript object notation lmao
//===============================================================
const Helper = require('./helper.js');
const Datastore = require('nedb');
const doc = new Datastore('testDataStorage/yakJS.db');
doc.loadDatabase();
const fs = require('fs');
var router = express.Router();
var yakJ = fs.readFileSync('yak.json');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var herdResponse;
const woolIndex = 0;
const milkIndex = 1;
class YakElement{
	constructor(name, age, sex, ageLastShaved){
		this.name = name;
		this.age = age;
		this.sex = sex;
		this.ageLastShaved = ageLastShaved;
		var death = false;
	}
}

//===========================================================
app.get('/yak-shop/herd/:T',addTime);
function addTime(request,response){
	var t = request.params.T;
	if(t==100){ //if 100 days, turn it to a year.
		var time = parseFloat(1);
	}else{
		var time = parseFloat('0.'+ t);
	}
	//console.log("TIME: ",time);
	var y = JSON.parse(yakJ);

	for(item of y.herd){
		//console.log("TESTTTT: ",item);
		var age = item.age;
		var sum = parseFloat(age) + time;
		item.age = sum;
		//console.log("TESTTTT: ",item);
		item["ageLastShaved"]=parseFloat(age);
	}
	response.send(JSON.stringify(y,null,'\t')); //json is not altered.
}
//===========================================================

app.get('/yak-shop/load', function(req, res, next){
	//console.log("We tryna READ");
	const xmlfile = "yak.xml";

	fs.readFile(xmlfile, "utf-8", function(error, text){
		if(error){
			console.log("ERRORRRRR");
			throw error;
			//response.end();
			return;
		}else{
			//console.log("PARSING NOW");
			parser.parseString(text, function(err, result){
				if(err){
					console.log("ERROR IN PARSING");
					throw err;
					return;
				}else{
					console.log("WE IN READ FILE HERE");

					herdObj= xmlToJS(result);

					herdObj["status"]= 'HTTP 205 (Reset Content)';
					console.log("herdObj", herdObj.status);
				}

			});
		}
	});
	//res.json({test: "123 WE R IN GET"});
	res.json(herdObj);
});
//========================================================================


function xmlToJS(result){
	console.log("WE IN XMLTOJS");
	var herd = result['herd']['labyak'];
	var object=[];
	var herdOb = {};
	herdOb.herd = [];
	var i;
	for( i = 0 ; i < herd.length ; i++ ){
		var yakOb = new YakElement(herd[i]['$']['name'],herd[i]['$']['age'],herd[i]['$']['sex']);
		herdOb.herd.push(yakOb);
		object.push( {name: `${herd[i]['$']['name']}`, age: `${herd[i]['$']['age']}`, sex:`${herd[i]['$']['sex']}`} );
	}
	//var yaks = JSON.parse(yakJ);
	var jsonObj = JSON.parse(JSON.stringify(herdOb,null,2));
	var jsonString = JSON.stringify(jsonObj, null, 2); //2 indents
	fs.writeFile('yak.json',jsonString, finished);
	function finished(err){
		console.log('all set');
		reply = {
			msg: "xml written to json."
		}
	}

	return(jsonObj);
}


//==================================================CONSTANTS:
const database = new Datastore('database.db'); //making database that has a path to a filename, local file stored on this computer.
database.loadDatabase(); //will load existing data into memory. if not there, will create.
//database.insert({name: 'Machie', status: '🔥', _id: '12345'});
//==========================================================
//Sets up route called api, to receives req
//===========================YAKSHOP=============================

/*
app.post('/yak-shop/order/:T/:name/:milk/:fleeces', preOrder){

}*/
app.post('/orderButton',sendOrder); //app.post('/orderButton',(request,response) =>
function sendOrder(request, response) {//2 arguments, request holds all contained in request, all data n info. response holds all info to send things back to client.
	const dataFromRequestBody = request.body; //data is in request.body so we make a constant to access vars
	doc.insert(dataFromRequestBody);
	var milk =  dataFromRequestBody.milk;
	var fleece =  dataFromRequestBody.fleece;
	var t = dataFromRequestBody.Tvalue;
	var available = Helper.getProducts(dataFromRequestBody.Tvalue);

	console.log("MILK: ",available[milkIndex],"WOOL: ", available[woolIndex]);
	console.log("\nMilk Wanted: ",milk, " Milk Available: ", available[milkIndex]);
	console.log("Wool Wanted: ",fleece, " Wool Available: ", available[woolIndex],"\n");

	if( milk < available[milkIndex] && fleece < available[woolIndex] ){ //IF MILK IS AVAILABLE
		//if ORDER CAN BE FULFILLED COMPLETELY:
			options = { //sending back response to client (shows up on their console log)
				status: 'HTTP 201 CREATED',
				message: 'ORDER RECEIVED, BOTH AVAILABLE:',
				order: {
					milk: milk,
					fleece: fleece,
					customer: dataFromRequestBody.customer,
				}
			}
	}else {
		var m = available[milkIndex] - milk;
		var f = available[woolIndex] - fleece;

		//check milk first.
		if( m < 0 ){ //if milk is unavailable

			if(f < 0){ //if fleece is ALSO unavailable
				options = { //BOTH UNAVAILABLE
					status: 'HTTP 422 UNPROCESSABLE ENTITY',
					message: 'BOTH ITEMS UNAVAILABLE:',
					order: {
						 milk: milk,
						 fleece: fleece,
						 customer: dataFromRequestBody.customer,
					},
					available: {
						milk: available[milkIndex],
						fleece: available[woolIndex]
					},
					fulfilled: null
				}
			}else{ //NO milk, but YES fleece.
				options = {
					status: 'HTTP 206 PARTIAL CONTENT',
					 message: 'ONLY FLEECE ORDER FULFILLED:',
					 order: {
						 milk: milk,
						 fleece: fleece,
						 customer: dataFromRequestBody.customer,
					},
					available: {
						milk: available[milkIndex],
						fleece: available[woolIndex]
					},
					fulfilled: {
						fleece: fleece,
					}
				}
			}
		}else{ //YES milk, NO fleece.
			options = {
				status: 'HTTP 206 PARTIAL CONTENT',
				message: 'ONLY MILK ORDER FULFILLED:',
				order: {
					milk: milk,
					fleece: fleece,
					customer: dataFromRequestBody.customer,
				},
				available: {
					milk: available[milkIndex],
					fleece: available[woolIndex]
				},
				fulfilled: {
					milk: milk,
				}
			}
		}
	}
	response.json(options);
}
//-----------------------------------------------------
app.get('/yak-shop/stock/:T',addStockTime);
function addStockTime(request,response){

	var time = parseFloat(request.params.T);
	console.log("\nT: ",time);
	var woolMilk = Helper.getProducts(time); //receives two parameters from getProducts function.
	var x = JSON.stringify({milk:woolMilk[milkIndex], fleeces: woolMilk[woolIndex]},null,2);

	response.send(x); //json is not altered.
}
//---------------------------------------------------------
app.get('/time', (request, response) => {

	const dataFromRequestBody = request.body;
	doc.find({},(err,data) => {
		if(err){
			response.end();
			return;
		}
		console.log("THIS IS THE SENT BACK DATA: ",data);
		console.log("TIME", dataFromRequestBody.time);
		response.json(data);
		//response.json({test: 123 WE R IN GET});
	});
});

app.get("http://localhost:3333/index.html/linkme", (request, response) => { //this function sends the database back to the client.
	//console.log("In app.get in index.js");
	const dataFromRequestBody = request.body;
	doc.find({},(err,data) => {
		if(err){
			response.end();
			return;
		}
		console.log("THIS IS THE SENT BACK DATA: ",data);
		console.log("TIME", dataFromRequestBody.time);
		response.json(data);
		//response.json({test: 123 WE R IN GET});
	});
});
