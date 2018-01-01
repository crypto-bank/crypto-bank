/**
 * 
 */

import * as os from 'os';
import * as cluster from 'cluster';
import { chunk } from 'lodash';

import { Currency } from 'cb-currency'
import { Events } from 'cb-stream';
import { connect, send } from 'cb-stream-zmq';

import * as bittrex from './client';
import { convert } from './convert';

const numWorkers = 24;
let totalSent = 0;

// Connect push socket
connect('tcp://127.0.0.1:5558');

const getSubPairs = () => bittrex.getMarkets()
  .then((data) => data.result
    .filter(currencyFound)
    .map((coin: any) => `${coin.BaseCurrency}-${coin.MarketCurrency}`));

const getSubPairsChunks = () => getSubPairs()
  .then((pairs: string[]) => chunk(pairs, pairs.length / numWorkers));

const subPairs = (pairs: string[]) => bittrex.connectStream()
  .then(() => console.log('WebSocket connected'))
  .then(() => bittrex.subscribe(pairs, (data: any) => {
    if (data.M === 'updateExchangeState') {
      data.A.map(convert).forEach((events: Events) => {
        totalSent++;
        send(events);

        if (totalSent % 1000 === 0) {
          console.log(`Sent ${totalSent} messages.`);
        }
      });
    }
  }));

const currencyFound = (coin: any) => !!Currency[coin.MarketCurrency];


if (cluster.isMaster) {
  getSubPairsChunks()
    .then((chunks: string[][]) => chunks.forEach((chunk: string[]) => {
      const worker = cluster.fork();
      worker.on('online', () => {
        worker.send(JSON.stringify(chunk));
      });
    }))

} else {
  process.on('message', (msg: string) => {
    console.log('Received message', msg);
    subPairs(JSON.parse(msg));
  });
}