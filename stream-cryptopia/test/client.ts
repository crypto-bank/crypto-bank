/**
 * Cryptopia websocket stream.
 */
import { stream } from '../src';
import { Events } from '@cbank/market';

const handler = {
  disconnected: () => {
    console.log('disconnected')
  },
  events: (events: Events) => {
    console.log(events)
  }
}

stream(handler).then()
