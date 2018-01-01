/**
 * Cryptopia websocket stream.
 */
import { Event } from 'cb-stream';

/**
 * Stream action.
 */
export interface Action {
  DataType: number;
  Action: number;
  Type: number;
  Rate: number;
  Total: number;
  Amount: number;
  TradePairId: number;
  UserId?: any;
  Timestamp?: string;
}

/**
 * Cryptopia stream message.
 */
export interface Message {
  C: string;
  M: {
    H: string;
    M: string;
    A: Action;
  }[];
}


/**
 * Parses cryptopia stream message into market hub events.
 * 
 * @param message Stream message.
 */
export function parseMessage(body: any) {
  const message: Message = JSON.parse(body.utf8Data);
  if (message.M) {
    message.M.forEach((msg: any) => {
      if (msg.H === 'NotificationHub' && msg.M === 'SendTradeDataUpdate') {
        msg.A.forEach((event: any) => {
          if (event.DataType === 0) {
            console.log(getOrderKind(event), JSON.stringify(event))
          } else if (event.DataType === 1) {
            console.log('trade', getOrderKind(event), JSON.stringify(event))
          } else {
            // console.log(event) // candle
          }
        })
      }
    })
  }
  return false;
}

const getTradeKind = (action: Action): 'Ask' | 'Bid' => {
  return action.Type === 0 ? 'Bid' : 'Ask';
}

const getOrderKind = (action: Action): 'Ask' | 'Bid' => {
  if (action.Action === 0) {
    return action.Type === 0 ? 'Bid' : 'Ask';
  }
  if (action.Action === 1) { // remove (zero) rate
    // TODO(crackcomm): it is fucking weird ain't it
    // we need visualizations to check this shit out
    return action.Type === 0 ? 'Bid' : 'Ask';
  }
  if (action.Action === 3) { // remove (zero) rate
    return action.Type === 0 ? 'Bid' : 'Ask';
  }
  return action.Type === 0 ? 'Bid' : 'Ask';
}
