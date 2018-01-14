/**
 * @license Apache-2.0
 */

/**
 * Market name.
 */
export type Market = 'Poloniex' | 'Bitfinex' | 'Bittrex' | 'Binance' | 'Cryptopia';

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
  id?: number;
  order: Order;
  timestamp: number;
}

/**
 * Currency pair.
 */
export interface CurrencyPair {
  quote: string;
  base: string;
}

/**
 * Market event.
 */
export interface Event {
  Trade?: Trade;
  NewOrder?: Order;
  ResetOrder?: Order;
  RemoveOrder?: Order;
  OrderBook?: OrderBook;
}

/**
 * Market stream event.
 */
export interface Events {
  pair: CurrencyPair;
  market: Market;
  events: Event[];
  seq?: number;
  timestamp?: number;
}

/**
 * Order book.
 */
export interface OrderBook {
  pair: CurrencyPair;
  asks: SimpleOrder[];
  bids: SimpleOrder[];
}

/**
 * Order in books.
 */
export interface SimpleOrder {
  r: number; // rate
  a: number; // amount
}

export * from './symbols';
