//! Market order books database for multiple currency pairs.

use std::sync::{Arc, RwLock};
use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::collections::BTreeMap;

use ordered_float::OrderedFloat;

use orca_currency::{Pair};
use super::{Order, OrderKind};

/// Market order books database for multiple currency pairs.
/// It can be safely used across multiple threads.
#[derive(Clone)]
pub struct OrderBooks {
    books: Arc<RwLock<HashMap<Pair, Arc<RwLock<OrderBook>>>>>,
}

impl OrderBooks {
    /// Creates new in-memory order books database.
    pub fn new() -> Self {
        OrderBooks {
            books: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Gets order books for currency pair.
    pub fn books(&self, pair: &Pair) -> Option<Arc<RwLock<OrderBook>>> {
        match self.books.read().unwrap().get(pair) {
            Some(books) => Some(books.clone()),
            None => None,
        }
    }

    /// Merges order books for a currency pair.
    pub fn merge(&mut self, mut books: OrderBook) {
        match self.books.write().unwrap().entry(books.pair) {
            Entry::Occupied(mut entry) => {
                entry.get_mut().write().unwrap().merge(&mut books);
            },
            Entry::Vacant(entry) => {
                entry.insert(Arc::new(RwLock::new(books)));
            },
        }
    }

    /// Updates currency pair order.
    pub fn update(&mut self, order: Order) {
        // Convert rate and volume to ordered float,
        // so we can compare it and sort.
        let rate = OrderedFloat(order.rate.amount());
        let volume = OrderedFloat(order.volume.amount());

        // Book by currency pair and order kind
        let mut books = self.books.write().unwrap();
        let books = books.get_mut(&order.pair()).unwrap();
        let mut book = books.write().unwrap();
        let mut book = book.book_mut(&order.kind);

        // Insert volume on rate to order book
        // or remove the rate if volume is zero
        if volume == OrderedFloat(0.0) {
            book.remove(&rate);
        } else {
            book.insert(rate, volume);
        }
    }
}
