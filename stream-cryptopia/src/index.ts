/**
 * Cryptopia websocket stream.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as signalR from 'signalr-client';
import { Events } from '@cbank/market';
import Cryptopia from '@cbank/cryptopia';

import { parseMessage, Message } from './parse';

const apiClient = new Cryptopia();

const hubAddress = 'wss://www.cryptopia.co.nz/signalr';
const hubList = ['notificationhub']

const getCookies = async () => {
  const resp = await axios.get('https://www.cryptopia.co.nz/Exchange');
  return resp.headers['set-cookie'];
};

const tradePairsToDict = (pairs: any[]) => {
  const pairIds: { [key: number]: string } = {};
  pairs.forEach(pair => pairIds[pair.Id] = pair.Label);
  return pairIds;
}

/**
 * Stream events handler.
 */
export interface Handler {
  events(events: Events): void;
  disconnected(): void;
}

/**
 * Connects to cryptopia stream.
 * @param handler Event handler.
 */
export async function stream(handler: Handler) {
  const pairs = tradePairsToDict(await apiClient.getTradePairs());
  console.log(pairs);
  const cookies = await getCookies();
  const client = new signalR.client(hubAddress, hubList, 0, true);
  client.headers.cookie = cookies.filter((cookie: string) => !cookie.startsWith('___utm'));
  client.serviceHandlers = {
    disconnected: handler.disconnected,
    messageReceived: (message: Message) => {
      handler.events(parseMessage(message, pairs));
    },
  };
  return client.start();
};
