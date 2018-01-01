/**
 * Bittrex client.
 */

import * as bittrex from 'node-bittrex-api';

function promisify(fn: Function) {
  return (...args: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      fn(...args, (resp: any, err: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(resp)
        }
      })
    })
  }
}

/**
 * Gets all markets on bittrex.
 */
export const getMarkets = promisify(bittrex.getmarkets)

/**
 * Connects websocket stream client.
 */
export const connectStream = promisify(bittrex.websockets.client)

/**
 * Gets websocket stream client.
 */
export const subscribe = bittrex.websockets.subscribe;
