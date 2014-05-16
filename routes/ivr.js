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
  	//console.log('patient called '+p_id);

	plivoivr.Call.outbound(call_from, p_number, ['welcome', p_id]);

});

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
						} else {
							console.log("error is " + error);
							if (response.statusCode) {
								console.log("response is " + response.statusCode);
							}
							console.log("body is " + body);
							plivo_response
								.speak("Sorry, your doctor is not available today. Goodbye.")
								.send();
						}
					}
				);
/*
			plivo_response
				.speak("Sorry, your doctor is not available today. Goodbye.")
				.send();			*/					
		}

	})
	.on('hangup', function(params) {
		console.log('call ended with: ' + params.From);
		console.log(params);
	});

/*
plivoivr.on('answer', function(params, response) {
    console.log('answered call from: ' + params.From);

    var MIN_GUESS = 1,
        MAX_GUESS = 100,
        guess = MIN_GUESS + Math.round(Math.random() * (MAX_GUESS - MIN_GUESS));

    response.speak('Pick a number between one and one hundred')     // Spelling out 100, otherwise speak pronounces it "1-o-o".
        .wait(3)
        .speak("I'm guessing it's " + guess)
        .getDigits({
            action: ['guess', MIN_GUESS, MAX_GUESS, guess],
            numDigits: 1,
            validDigits: '*#0',
            finishOnKey: '123456789',
            timeout: 45
        }, function() {
            response.speak("If the number you're thinking of is lower than " + guess + ", press star; " +
                "if it's higher press pound; and if it's correct press 0.")
        })
        .speak("I didn't catch that. Goodbye.")
        .send();
})
.on('guess/:min/:max/:guess', function(params, response) {
    var min = parseInt(params.min, 10),
        max = parseInt(params.max, 10),
        guess = parseInt(params.guess, 10),
        newGuess,
        direction;

    // Look at what digit the user pressed to determine how to guess next, or if we guessed right.
    switch (params.Digits) {
        case '*':
            direction = 'lower';
            max = guess - 1;
            break;
        case '#':
            direction = 'higher';
            min = guess + 1;
            break;
        case '0':
            console.log(params.From + ': ' + guess + ' was correct!');
            response
                .speak('Hooray! Thanks for playing. Goodbye.')
                .send();
            return;
    }

    if (min > max) {
        // The user told us the number is higher than the min, and less than the max, no compute.
        response
            .speak("I've run out of numbers. Goodbye.")
            .send();
        return;
    } else if (max === min) {
        // We've narrowed it down to one number
        newGuess = min;
    } else {
        // We could just do a binary search and guess right in the middle, but
        // let's add a bit of randomness to make things a bit less predictable.
        var randomnessAmount = Math.round((max - min) * 0.2),
        random = Math.random() * randomnessAmount - randomnessAmount / 2;

        newGuess = Math.round((max + min - randomnessAmount) / 2 + random);
    }

    // Pick a random start to the question to add some variability.
    var questions = ['How about ', 'Is it ', 'Perhaps ', 'Could it be '],
        question = questions[Math.floor(Math.random() * questions.length)] + newGuess + '?';

    console.log([params.From,  ': The number is ', direction,  ' than ' + guess, '. ', question].join(''));

    // Ask the user again.
    response
        .getDigits({
            action: ['guess', min, max, newGuess],
            numDigits: 1,
            validDigits: '*#0',
            finishOnKey: '123456789',
            timeout: 45
        }, function() {
            response.speak(question)
        })
        .speak("I didn't catch that. Goodbye.")
        .send();
})
.on('hangup', function(params) {
    console.log('call ended with: ' + params.From);
    console.log(params);
});*/

module.exports = router;
