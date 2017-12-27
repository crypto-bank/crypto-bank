//! Market order books database for multiple currency pairs.

use std::sync::{Arc, RwLock};
use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::collections::BTreeMap;

use ordered_float::OrderedFloat;

use orca_currency::{Pair};
use super::{Order, OrderKind};


/// Sorted map of orders – keys are rates, values are amounts.
pub type OrderMap = BTreeMap<OrderedFloat<f64>, OrderedFloat<f64>>;

/// Order book for both ask and bid orders.
#[derive(Debug)]
pub struct OrderBook {
    /// Currency pair.
    pub pair: Pair,

    /// Sorted map of ask orders.
    pub asks: OrderMap,

    /// Sorted map of bid orders.
    pub bids: OrderMap,
}

impl OrderBook {
    /// Constructs new order book.
    pub fn new(pair: Pair) -> OrderBook {
        OrderBook {
            pair: pair,
            asks: BTreeMap::new(),
            bids: BTreeMap::new(),
        }
    }

    /// Returns order book by order kind.
    pub fn book(&self, kind: &OrderKind) -> &OrderMap {
        match kind {
            &OrderKind::Ask => &self.asks,
            &OrderKind::Bid => &self.bids,
        }
    }

    /// Returns mutable order book by order kind.
    pub fn book_mut(&mut self, kind: &OrderKind) -> &mut OrderMap {
        match kind {
            &OrderKind::Ask => &mut self.asks,
            &OrderKind::Bid => &mut self.bids,
        }
    }

    /// Merges another order books into current struct.
    pub fn merge(&mut self, books: &mut OrderBook) {
        self.asks.append(&mut books.asks);
        self.bids.append(&mut books.bids);
    }
}
