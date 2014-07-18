//All configs are injected from environment variables
var port = process.env.PORT || 3000;
//the api endpoint on telemed server to make ivr appointment
var callback_url = process.env.QUICK_APPOINTMENT_API;

var plivoivr = {
  appID: process.env.APP_ID,
  authID: process.env.AUTH_ID,
  authToken: process.env.AUTH_TOKEN,
  rootUrl: process.env.ROOT_URL //the address to enable plivoivr, has to be on the same host  
};

//patient info are injected when patient add the app
var patientId = process.env.patientId; 
var patientNum = process.env.phoneNumber;

module.exports = {
  plivoivr: plivoivr,
  callback_url: callback_url,
  port: port,
  patientId: patientId,
  patientNum: patientNum,
  callerNum: '13479975332'
};