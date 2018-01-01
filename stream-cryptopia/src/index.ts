/**
 * Cryptopia websocket stream.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as signalR from 'signalr-client';

import { parseMessage, Message } from './parse';

const hubAddress = 'wss://www.cryptopia.co.nz/signalr';
const hubList = ['notificationhub']

let totalReceived = 0;

axios.get('https://www.cryptopia.co.nz/Exchange')
  .then((resp: any) => {
    // const $ = cheerio.load(resp.data);
    // const token = $('input[name="__RequestVerificationToken"]').val();
    return resp.headers['set-cookie'];
  })
  .then((cookies: string[]) => {
    const client = new signalR.client(hubAddress, hubList, 2, true);
    client.headers.cookie = cookies.filter((cookie: string) => !cookie.startsWith('___utm'));
    client.serviceHandlers = { //Yep, I even added the merge syntax here.
      messageReceived: (message: Message) => {
        parseMessage(message);
        totalReceived++;
        if (totalReceived % 1000 === 0) {
          console.log(`Received ${totalReceived} messages.`);
        }
      },
      bound: function () { console.log("Websocket bound"); },
      connectFailed: (error: any) => { console.log("Websocket connectFailed: ", error); },
      connected: (connection: any) => { console.log("Websocket connected"); },
      disconnected: () => { console.log("Websocket disconnected"); },
      onerror: (error: any) => { console.log("Websocket onerror: ", error); },
      bindingError: (error: any) => { console.log("Websocket bindingError: ", error); },
      connectionLost: (error: any) => { console.log("Connection Lost: ", error); },
      reconnecting: (retry: any) => {
        console.log("Websocket Retrying: ", retry);
        //return retry.count >= 3; /* cancel retry true */
        return true;
      }
    };

    return client.start();
  });
