
use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::collections::BTreeMap;

use market::{Order, OrderKind};
use super::OrderMap;


/// Order books for both ask and bid orders.
#[derive(Debug)]
pub struct OrderBooks {
    /// Currency pair.
    pub pair: ::currency::Pair,

    /// Sorted map of ask orders.
    pub asks: OrderMap,

    /// Sorted map of bid orders.
    pub bids: OrderMap,
}

impl OrderBooks {
    /// Constructs new order book.
    pub fn new(pair: ::currency::Pair) -> Self {
        OrderBooks {
            pair: pair,
            asks: OrderMap::default(),
            bids: OrderMap::default(),
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
    pub fn merge(&mut self, books: &mut OrderBooks) {
        self.asks.append(&mut books.asks);
        self.bids.append(&mut books.bids);
    }
}
