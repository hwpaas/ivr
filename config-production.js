//All configs are injected from environment variables
var port = process.env.PORT || 3000;
//the api endpoint on telemed server to make ivr appointment
var callback_url = process.env.QUICK_APPOINTMENT_API || 'wait to be filled';

var plivoivr = {
  appID: process.env.APP_ID || 'wait to be filled',
  authID: process.env.AUTH_ID || 'wait to be filled',
  authToken: process.env.AUTH_TOKEN || 'wait to be filled',
  rootUrl: process.env.ROOT_URL || 'http://whaterver:1234/' //the address to enable plivoivr
};
var callerNum = process.env.CALLER_NUM || 'wait to be filled';

//patient info are injected when patient add the app
var patientApiUrl = process.env.PATIENT_API_URL;

module.exports = {
  plivoivr: plivoivr,
  callback_url: callback_url,
  port: port,
  patientApiUrl: patientApiUrl,
  callerNum: callerNum
};