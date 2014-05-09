var express = require('express');
var router = express.Router();
var plivode = require('plivode');
var request = require('request');
var moment = require('moment');

var plivoivr = new plivode.App({
		appID: '17094092654309214',
		authID: 'MANJJMYME2ZMY0NJRKYW',
		authToken: 'N2I2ZmY2YTdlMDQ4MTVlOWU0NTVlNDBmODM3YWE5',
		rootUrl: 'http://caas.hwpaas.com:80/'
	});

/* Handles POST from other applications */
router.post('/', function(req, res) {
	var p_id = req.body.pid,
		p_number = req.body.pnumber,
		call_from = '16469346439';

  	res.json({ message: 'patient called', pid: p_id });
	
	plivoivr.Call.outbound(call_from, p_number, ['welcome']);

	plivoivr.on('welcome', function(params, response) {
		console.log('calling patient ' + p_id);

		response.speak("Hi. This is from Telemed IVR. We found irregular data from your monitor. We would like to make an appointment for you.") 
			.getDigits({
				//action: ['appointment', num],
				action: ['appointment', p_id],
				numDigits: 1,
				validDigits: '1',
				finishOnKey: '234567890#*',
				timeout: 30
			}, function() {
				response.speak("Press 1 to make an appointment. Otherwise please hang up.")
			})
			.speak("Sorry, I didn't catch that. Please hangup.")
			.send();
	})
	.on('appointment/:p_id', function(params, response) {
		var pid = params.p_id;
		
		// Look at what digit the user pressed to determine what to do next.
		switch (params.Digits) {
			case '1':
				console.log("Patient " + p_id + " is making a new appointment.");
				request.post(
					'https://www.hwwebrtclab.com/database/quickappointments',
					{form: {p_id: pid}},
					function (error, response, body) {
						if (!error && response.statusCode == 200) {
							console.log(body);
							var date = moment(body.AppStartTime).toDate();
							var minute = date.getMinutes;
							if(date.getMinutes == 0){
								minute = "o'clock";
							}

							response
								.speak('Your appointment is booked! It will start at ' + date.getHours())
								.wait(1)
								.speak(minute)
								.wait(1)
								.speak('Thanks for using this service. Goodbye.')
								.send();
							return;
						} else {
							response
								.speak("Sorry, your doctor is not available. Goodbye.")
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