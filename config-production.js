//All configs are injected from environment variables
var port = process.env.PORT || 3000;
var callback_url = process.env.CALLBACK_URL;

var plivoivr = {
  appID: process.env.APP_ID,
  authID: process.env.AUTH_ID,
  authToken: process.env.AUTH_TOKEN,
  rootUrl: process.env.ROOT_URL //the address to enable plivoivr, has to be on the same host  
};

var patientId = process.env.PATIENT_ID;
var patientNum = process.env.PATIENT_NUM;

module.exports = {
  plivoivr: plivoivr,
  callback_url: callback_url,
  port: port,
  patientId: patientId,
  patientNum: patientNum,
  callerNum: '13479975332'
};