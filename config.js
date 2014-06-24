var PROTOCOL = process.env.NODE_PROTOCOL || 'http';
var port = process.env.NODE_PORT || 3000;
var callback_url = PROTOCOL + "://caas.hwpaas.com/database/quickappointments";

var plivoivr = {
  appID: '17094092654309214',
  authID: 'MANJJMYME2ZMY0NJRKYW',
  authToken: 'N2I2ZmY2YTdlMDQ4MTVlOWU0NTVlNDBmODM3YWE5',
  rootUrl: 'http://caas.hwpaas.com:2001/'    
};

/*
if(process.env.NODE_ENV=='production'){
  callback_url = "http://localhost/database/quickappointments"; 
}*/

module.exports = {
  plivoivr: plivoivr,
  callback_url: callback_url,
  port: port
};