/**
 * @license Apache-2.0
 */

/**
 * Market order.
 */
export interface Order {
  kind: 'Ask' | 'Bid';
  rate: number;
  amount: number;
  total?: number;
}

/**
 * Market trade.
 */
export interface Trade {
  id: number;
  order: Order;
  timestamp: number;
}

/**
 * Currency pair.
 */
export interface Pair {
  quote: string;
  base: string;
}

/**
 * Market event.
 */
export interface Event {
  Trade?: Trade;
  Order?: Order;
  OrderBook: OrderBook;
}

/**
 * Market stream event.
 */
export interface Events {
  seq: number;
  market: string;
  pair: Pair;
  events: Event[];
}

/**
 * Order book.
 */
export interface OrderBook {
  pair: Pair;
  asks: SimpleOrder[];
  bids: SimpleOrder[];
}

/**
 * Order in books.
 */
export interface SimpleOrder {
  // rate
  r: number;
  // amount
  a: number;
}

export * from './symbols';
