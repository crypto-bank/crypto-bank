var signalR = require('signalr-client');

var client = new signalR.client(
  "https://www.cryptopia.co.nz/signalr", ['notificationHub'],
  undefined,
  true,
);

client.serviceHandlers.messageReceived = function(message) {
  /* message: this is the raw message received on the websocket */

  console.log(message)

  return true; //if true the client handler for the hub will not be raised.
  //if false the client handler will be raised.
}

client.serviceHandlers.onUnauthorized = function(res) {
  console.log('UNAUTHORIZED', res)
  // //Do your Login Request
  // var location = res.headers.location;
  // var result = http.get(location, function (loginResult) {
  //     //Copy "set-cookie" to "client.header.cookie" for future requests
  //     client.headers.cookie = loginResult.headers['set-cookie'];
  // });
}

client.headers.cookie = 'visid_incap_1244263=5dm+1mZsRmKPfxS4iqT5urFMNloAAAAAQUIPAAAAAABUbDsQIUcjFELFmZ51kdAD; __RequestVerificationToken=7VCEZPMVbr231lV0BRYGufvTaip6SdYEGxBkAgb1R-6Ux26nLABiifBjQu6f8SNUuKZfj5Dph_N5Tpo8oIbVKtiESZ3iaTYrs-s1s5fnApE1; nlbi_1244263=BRFna9plXCw/rdOj7zprsAAAAADIkh7NEDCryxXuwT6KuZ0P; incap_ses_521_1244263=g6HWGKTzEDzQuCpiS/c6BziOQFoAAAAAD9dTGwA3Fd/XGLyWpOqa+g=='
client.headers['Referer'] = 'https://www.cryptopia.co.nz/Exchange?market=RDD_BTC'
client.headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0'
client.headers['X-Requested-With'] = 'XMLHttpRequest'

client.start();

client.serviceHandlers = {
  bound: function() {
    console.log('Websocket bound');
  },
  connectFailed: function(error) {
    console.log('Websocket connectFailed: ', error);
  },
  disconnected: function() {
    console.log('Websocket disconnected');
  },
  onerror: function(error) {
    console.log('Websocket onerror: ', error);
  },
  bindingError: function(error) {
    console.log('Websocket bindingError: ', error);
  },
  connectionLost: function(error) {
    console.log('Connection Lost: ', error);
  },
  reconnecting: function(retry) {
    console.log('Websocket Retrying: ', retry);
    // change to true to stop retrying
    return false;
  },
  connected: function() {
    console.log('Websocket connected');
  },
};