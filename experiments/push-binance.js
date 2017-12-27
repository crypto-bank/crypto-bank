// producer.js
var zmq = require('zmq')
  , sock = zmq.socket('push');

sock.connect('tcp://127.0.0.1:5558');
console.log('Producer connected to port 5558');

const binance = require('binance');

// const binanceRest = new binance.BinanceRest({
//   key: 'api-key', // Get this from your account on binance.com
//   secret: 'api-secret', // Same for this
//   timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
//   recvWindow: 10000, // Optional, defaults to 5000, increase if you're getting timestamp errors
//   disableBeautification: false
//   /*
//    * Optional, default is false. Binance's API returns objects with lots of one letter keys.  By
//    * default those keys will be replaced with more descriptive, longer ones.
//    */
// });

const binanceWS = new binance.BinanceWS();

binanceWS.onDepthUpdate('BNBBTC', (data) => {
  // console.log(data);
  sock.send(JSON.stringify(data));
});

binanceWS.onAggTrade('BNBBTC', (data) => {
  // console.log(data);
  sock.send(JSON.stringify(data));
});

binanceWS.onKline('BNBBTC', '1m', (data) => {
  // console.log(data);
  sock.send(JSON.stringify(data));
});

/*
 * onUserData requires an instance of BinanceRest in order to make the necessary startUserDataStream and
 * keepAliveUserDataStream calls.  The webSocket instance is returned by promise rather than directly
 * due to needing to request a listenKey from the server first.
 */
// binanceWS.onUserData(binanceRest, (data) => {
//   console.log(data);
// }, 60000) // Optional, how often the keep alive should be sent in milliseconds
//   .then((ws) => {
//     // websocket instance available here
//   });