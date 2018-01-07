/**
 * Cryptopia websocket stream.
 */
import { Events } from '@cbank/market';

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
export function parseMessage(body: any, pairs: { [key: number]: string }): Events {
  const events: Events = {
    seq: 0,
    market: 'Cryptopia',
    pair: { quote: '', base: '' },
    events: []
  };
  const message: Message = JSON.parse(body.utf8Data);
  console.log(message)
  if (message.M) {
    message.M.forEach((msg: any) => {
      if (msg.H === 'NotificationHub' && msg.M === 'SendTradeDataUpdate') {
        msg.A.forEach((event: any) => {
          if (event.DataType === 0) {
            if (event.Action === 1 || event.Action === 3) {
              console.log('remove order', getOrderKind(event), JSON.stringify(event))
            } else if (event.Action === 3) {
              console.log('create order', getOrderKind(event), JSON.stringify(event))
            }
          } else if (event.DataType === 1) {
            console.log('trade', getOrderKind(event), JSON.stringify(event))
          } else {
            // console.log(event) // candle
          }
        })
      }
    })
  }
  return events;
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
