console.log('hello, now commencing helper.js that contains produce calculations.............');

module.exports =
{

	getProducts: function(time){
		const fs = require('fs');
		var yakJ = fs.readFileSync('yak.json');

		var totalYakLiters = 0;
		var totalWoolen = 0;
		var y = JSON.parse(yakJ);

		for(item of y.herd){
			var ageInDaysAt0 = parseFloat(item.age *100);
			var liter = getMilk(ageInDaysAt0, time);
			var wool = getWool(ageInDaysAt0, time);
			console.log("\nThis little Yak's Age: ",ageInDaysAt0);
			console.log("This", item.name ," produced: ", liter," l of MILK");
			console.log("This little yak produced: ", wool," spool of WOOL");
			totalYakLiters += liter;
			totalWoolen += wool;
		}

		console.log("Total WOOLEN Produced At T: "+totalWoolen);
		console.log("Total l Of MILK Produced At T: "+totalYakLiters);
		var produce = [totalWoolen,totalYakLiters];
		return (produce);

		//====================================MILK CALCULATIONS
		function getMilk(age, T){
			console.log("WE OUT HEA");
			var total = 0;

			for(var i = 0; i < T; i++) {
				total += liters(age + i);
			}
			return total;
			//---------------------------
			function liters(ageInDays){
				return 50-0.03*ageInDays;
			}
		}
		//====================================WOOL CALCULATIONS
		function getWool(age,T){
			//T = type in number here for test
			var day = 0;
			var woolProduced = 1;
			console.log("BUZZZZZ................NO LONGER A SACRIFICIAL LAMB"); //Initial Shaving on Day 0
			//age = age at 0th Day.
			//T = 13 days, we want to see how much we can sell at morning of 13.
		      var againShave = checkNextShave(age);
			day+=againShave;
			console.log("Can be shaven again in ",againShave," days, on day: ", day);

			while(day < T){ //after initial day 0
				if(againShave < T){ //is againShave < T? if so SHAVEEE
					age+=againShave;
					console.log("BUZZZZ......................SHAVING AGAIN AT DAY: ", day, ", at Age: ",age);
					againShave = checkNextShave(age);
					day+=againShave;
					console.log("Can be shaven again in ",againShave," days, on day: ", day);
					woolProduced+=1;

				}else{
					console.log("AGAINSHAVE IS LARGER THAN T");
					break;
				}
			}

			console.log("Total wool by this Yak at T: ",woolProduced);
			return woolProduced;
			//---------------------------------------------------------
			function checkNextShave(age){
				//console.log("++++++++++++AGE: ",age)
				var nextShave = Math.floor((8 + age*0.01)+1);

				return nextShave;
			}
		}

	},

};
