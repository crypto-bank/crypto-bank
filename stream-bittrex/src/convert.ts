/**
 * @license Apache-2.0
 */

import { Events, Order, Trade } from '@cbank/market';

/**
 * Convert to hub events.
 */
export function convert(input: RecvEvent): Events {
  return {
    seq: input.Nounce,
    market: 'Bittrex',
    pair: parsePair(input.MarketName),
    events: [
      ...convertOrders(input.Buys, 'Bid').map((order: Order) => ({ Order: order })),
      ...convertOrders(input.Sells, 'Ask').map((order: Order) => ({ Order: order })),
      ...convertTrades(input.Fills).map((trade: Trade) => ({ Trade: trade })),
    ]
  }
}

export function parsePair(pair: string) {
  const [base, quote] = pair.split('-');
  return { base, quote };
}

export function convertOrders(orders: RecvOrder[], kind: 'Ask' | 'Bid'): Order[] {
  return orders.map((order: RecvOrder) => ({
    kind,
    rate: order.Rate,
    amount: order.Quantity,
  }))
}

export function convertTrades(trades: RecvTrade[]): Trade[] {
  return trades.map((trade: RecvTrade): Trade => ({
    id: 0,
    order: {
      kind: typeToKind(trade.OrderType),
      rate: trade.Rate,
      amount: trade.Quantity,
    },
    timestamp: Date.parse(trade.TimeStamp)
  }))
}

export function typeToKind(typ: 'BUY' | 'SELL'): 'Ask' | 'Bid' {
  return typ === 'BUY' ? 'Bid' : 'Ask';
}

export interface RecvOrder {
  Type: 0 | 1 | 2;
  Rate: number;
  Quantity: number;
}

export interface RecvTrade {
  OrderType: 'BUY' | 'SELL';
  Rate: number;
  Quantity: number;
  TimeStamp: string; // '2017-12-29T01:43:02.51'
}

export interface RecvEvent {
  MarketName: string,
  Nounce: number,
  Buys: RecvOrder[];
  Sells: RecvOrder[];
  Fills: RecvTrade[];
};
