/**
 * @license Apache-2.0
 */

import * as zmq from 'zmq';
import { Events } from '@cbank/market';

export const sock = zmq.socket('push');

/**
 * Connects to zmq socket.
 */
export function connect(addr: string) {
  return sock.connect(addr);
}

/**
 * Sends market events to zmq socket.
 */
export function send(events: Events) {
  return sock.send(JSON.stringify(events));
}
