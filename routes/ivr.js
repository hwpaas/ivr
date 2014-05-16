var express = require('express');
var router = express.Router();
var plivode = require('plivode');
var request = require('request');
var moment = require('moment');

var plivoivr = new plivode.App({
		appID: '17094092654309214',
		authID: 'MANJJMYME2ZMY0NJRKYW',
		authToken: 'N2I2ZmY2YTdlMDQ4MTVlOWU0NTVlNDBmODM3YWE5',
		rootUrl: 'http://caas.hwpaas.com:2001/'
	});
var PROTOCOL = process.env.NODE_PROTOCOL || 'http';
var CALLBACK_ADDR = process.env.CALLBACK_PORT_9000_TCP_ADDR || 'caas.hwpaas.com';
var CALLBACK_PORT = process.env.CALLBACK_PORT_9000_TCP_PORT || '9000';

var callback_url = PROTOCOL + "://" + CALLBACK_ADDR+":"+CALLBACK_PORT+"/database/quickappointments";
console.log(callback_url);

/* Handles POST from other applications */
router.post('/', function(req, res) {
	var p_id = req.body.pid,
		p_number = req.body.pnumber,
		call_from = '16469346439';

  	res.json({ message: 'patient called', pid: p_id });

	plivoivr.Call.outbound(call_from, p_number, ['welcome', p_id]);

	plivoivr.on('welcome/:p_id', function(params, response) {
		var p_id = params.p_id;
		var isCalled = false;
		console.log('calling patient ' + p_id);

		response.speak("Hi.") 
			.getDigits({
				//action: ['appointment', num],
				action: ['appointment', p_id],
				numDigits: 1,
				validDigits: '1',
				finishOnKey: '234567890#*',
				timeout: 20
			}, function() {
				response.speak("This is from Tele Med IVR. We found irregular data from your monitor. We would like to make an appointment for you. Press 1 to make an appointment. Otherwise please hang up.")
			})
			.speak("Sorry, I didn't catch that. Please hangup.");

		if(!isCalled){
			response.send();
			isCalled = true;
		}
	})
	.on('appointment/:p_id', function(params, response) {
		var p_id = params.p_id;
		var plivo_response = response;

		// Look at what digit the user pressed to determine what to do next.
		switch (params.Digits) {
			case '1':
				console.log("Patient " + p_id + " is making a new appointment.");
				request.post(
					callback_url,
					{form: {p_id: p_id}},
					function (error, response, body) {
						if (!error && response.statusCode == 200) {
							console.log(body);

							var isCalled = false;
							
							var AppStartTime = JSON.parse(body).AppStartTime;
							var date = moment(AppStartTime);
							var now = moment();
							var difference = moment.utc(date.diff(now)).format("HH:mm:ss");
							var differenceArray = difference.toString().split(":");
							var hour = parseInt(differenceArray[0]),
								minute = parseInt(differenceArray[1]);

							plivo_response
								.speak('Your appointment is booked! It will start at ' + hour + " hours")
								.wait(1)
								.speak(minute + " minutes later.")
								.wait(1)
								.speak('Thanks for using this service. Goodbye.');
							if(!isCalled){
								plivo_response.send();
								isCalled = true;
							}
							
							return;
						} else {
							console.log("error is " + error);
							if (response.statusCode) {
								console.log("response is " + response.statusCode);
							}
							console.log("body is " + body);
							plivo_response
								.speak("Sorry, your doctor is not available today. Goodbye.")
								.send();
							return;
						}
					}
				);				
		}

	})
	.on('hangup', function(params) {
		console.log('call ended with: ' + params.From);
		console.log(params);
	});
});

module.exports = router;
