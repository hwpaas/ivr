var express = require('express');
var router = express.Router();
var plivode = require('plivode');
var request = require('request');
var moment = require('moment');
var config = require('../config-'+process.env.NODE_ENV);

var plivoivr = new plivode.App({
		appID: config.plivoivr.appID,
		authID: config.plivoivr.authID,
		authToken: config.plivoivr.authToken,
		rootUrl: config.plivoivr.rootUrl
	});

/* Handles POST from other applications 
The actual logic is on ivr server, which we do not care here.
After initiate the call, it is done.
*/
router.post('/', function(req, res) {
	//get patient info from the patientApiUrl
	request.get(config.patientApiUrl,function(err, response, body){
		if (err) {
			console.log('err get patient info from '+config.patientApiUrl);
			res.json(500);
		}
		var patientInfo = JSON.parse(body);
		var p_number = patientInfo.phoneNumber,
			p_id = patientInfo.patientId,
			call_from = config.callerNum;
	  res.json({ message: 'patient called', pid: p_id });
		plivoivr.Call.outbound(call_from, p_number, ['welcome', p_id]);
	});
});

module.exports = router;
