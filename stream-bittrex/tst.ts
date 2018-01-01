/**
 * 
 */

import { Currency } from '../currency/src/symbols'

import * as zmq from 'zmq';
import * as bittrex from 'node-bittrex-api';

const sock = zmq.socket('push');

sock.connect('tcp://127.0.0.1:5558');
console.log('Producer connected to port 5558');

// bittrex.options({
//   'apikey': API_KEY,
//   'apisecret': API_SECRET,
// });


bittrex.connectStream()
  .then(() => bittrex.getMarkets())
  .then((data) => data.result
    .filter(currencyFound)
    .map((coin: any) => `${coin.BaseCurrency}-${coin.MarketCurrency}`))
  .then((pairs: string[]) => chunk(pairs, pairs.length / numCPUs))
  .then((pairs) => {
    return bittrex.subscribe(pairs, (data: any) => {
      if (data.M === 'updateExchangeState') {
        data.A.map(convert).forEach((events: Events) => {
          console.log()

          totalSent++;
          send(events);

          if (totalSent) {
            console.log(`Sent ${totalSent} messages.`);
          }
        });
      }
    })
  });
