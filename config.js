var PROTOCOL = process.env.NODE_PROTOCOL || 'http';
var CALLBACK_ADDR = process.env.CALLBACK_PORT_9000_TCP_ADDR || 'caas.hwpaas.com';
var CALLBACK_PORT = process.env.CALLBACK_PORT_9000_TCP_PORT || '9000';

var callback_url = PROTOCOL + "://" + CALLBACK_ADDR+":"+CALLBACK_PORT+"/database/quickappointments";

module.exports = {
  plivoivr : {
    appID: '17094092654309214',
    authID: 'MANJJMYME2ZMY0NJRKYW',
    authToken: 'N2I2ZmY2YTdlMDQ4MTVlOWU0NTVlNDBmODM3YWE5',
    rootUrl: 'http://caas.hwpaas.com:2001/'    
  },
  callback_url: callback_url
};