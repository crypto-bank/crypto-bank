/**
 * @license Apache-2.0
 */

/**
 * Currency pair.
 */
export interface Pair {
  quote: string;
  base: string;
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
 * Market event.
 */
export interface Event {
  Trade?: Trade;
  Order?: Order;
}

/**
 * Market order.
 */
export interface Order {
  kind: 'Ask' | 'Bid';
  rate: number;
  volume: number;
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
