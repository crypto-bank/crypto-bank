// producer.js
var zmq = require('zmq')
  , sock = zmq.socket('push');

sock.connect('tcp://127.0.0.1:5558');
console.log('Producer connected to port 5558');

var bittrex = require('node-bittrex-api');

// bittrex.options({
//   'apikey': API_KEY,
//   'apisecret': API_SECRET,
// });

bittrex.websockets.client(function () {
  console.log('Websocket connected');
  bittrex.websockets.subscribe(['BTC-ETH'], function (data) {
    if (data.M === 'updateExchangeState') {
      data.A.forEach(function (data_for) {
        // console.log('Market Update for ' + data_for.MarketName, data_for);
        sock.send(JSON.stringify(data_for));
      });
    }
  });
});
