var express = require('express');
var path = require('path');
var http =require('http');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var plivode = require('plivode');
var request = require('request');
var moment = require('moment');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
var config = require('./config-'+process.env.NODE_ENV);

var app = express();
var server = http.createServer(app); 

var index = require('./routes/index');
//var ivr = require('./routes/ivr');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
//app.use('/ivr', ivr);

app.get('/env', function(req, res) {
  res.json(process.env);
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.env === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var plivoivr = new plivode.App({
    appID: config.plivoivr.appID,
    authID: config.plivoivr.authID,
    authToken: config.plivoivr.authToken,
    rootUrl: config.plivoivr.rootUrl,
    expressApp: app
  });

plivoivr
  .on('welcome/:p_id', function(params, response) {
    var p_id = params.p_id;
    console.log('calling patient ' + p_id);

    response.speak("Hi.") 
      .getDigits({
        action: ['appointment', p_id],
        numDigits: 1,
        validDigits: '1',
        finishOnKey: '234567890#*',
        timeout: 20
      }, function() {
        response.speak("This is from Tele Med IVR. We found irregular data from your monitor. We would like to make an appointment for you. Press 1 to make an appointment. Otherwise please hang up.")
      })
      .speak("Sorry, I didn't catch that. Please hangup.");
  })

  .on('appointment/:p_id', function(params, response) {
    var p_id = params.p_id;
    var plivo_response = response;
    var p_number = params.To;

    var timezone="-07:00";
    if(p_number[1]=="1"){
      timezone='-07:00';
    }
    else if (p_number[1]=="8"){
      timezone='+08:00';
    }

    // Look at what digit the user pressed to determine what to do next.
    switch (params.Digits) {
      case '1':
        console.log("Patient " + p_id + " is making a new appointment.");
        
        request.post(config.callback_url,{form: {p_id: p_id, timezone: timezone}},
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(body);
                            
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
        break;
      break;          
    }

  })
  .on('hangup', function(params) {
    console.log('call ended with: ' + params.From);
    console.log(params);
  });

/* Handles POST from other applications */
app.post('/', function(req, res) {
  var p_id = config.patientId,
    p_number = config.patientNum,
    call_from = config.callerNum;

  res.json({ message: 'patient called', pid: p_id });
  plivoivr.Call.outbound(call_from, p_number, ['welcome', p_id]);

});

module.exports = app;

server.listen(config.port,function(){
console.log('Express app started on port ' + config.port);
}); 
