
use std::collections::BTreeMap;

use ordered_float::OrderedFloat;

use super::{CurrencyPair, Order, OrderKind, SimpleOrder};

/// Order book for one side of orders.
#[derive(Debug)]
pub struct OrderMap {
    inner: BTreeMap<OrderedFloat<f32>, OrderedFloat<f32>>,
}

impl OrderMap {
    /// Inserts order amount at rate.
    pub fn insert(&mut self, order: SimpleOrder) {
        self.inner.insert(OrderedFloat(order.rate), OrderedFloat(order.amount));
    }

    /// Appends to self from another order map.
    pub fn append(&mut self, other: &mut OrderMap) {
        self.inner.append(&mut other.inner);
    }
}

impl Default for OrderMap {
    fn default() -> Self {
        OrderMap {
            inner: BTreeMap::new(),
        }
    }
}

impl From<Vec<SimpleOrder>> for OrderMap {
    fn from(input: Vec<SimpleOrder>) -> Self {
        let mut book = OrderMap::default();
        for order in input.into_iter() {
            book.insert(order);
        }
        book
    }
}

/// Order books for both ask and bid orders.
#[derive(Debug)]
pub struct OrderBooks {
    /// Currency pair.
    pub pair: Option<CurrencyPair>,
    /// Sorted map of ask orders.
    pub asks: OrderMap,
    /// Sorted map of bid orders.
    pub bids: OrderMap,
}

impl OrderBooks {
    /// Constructs new order book.
    pub fn new(pair: CurrencyPair) -> Self {
        OrderBooks {
            pair: Some(pair),
            .. OrderBooks::default()
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

    // /// Updates order book using stream event.
    // pub fn from_events(&mut self, events: Events) {
    // }
}

impl Default for OrderBooks {
    fn default() -> Self {
        OrderBooks {
            pair: None,
            asks: OrderMap::default(),
            bids: OrderMap::default(),
        }
    }
}

impl From<OrderList> for OrderBooks {
    fn from(book: OrderList) -> Self {
        OrderBooks {
            pair: book.pair,
            asks: OrderMap::from(book.asks),
            bids: OrderMap::from(book.bids),
        }
    }
}

/// Simple order book.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct OrderList {
    /// Currency pair.
    pub pair: Option<CurrencyPair>,
    /// Ask orders.
    pub asks: Vec<SimpleOrder>,
    /// Bid orders.
    pub bids: Vec<SimpleOrder>,
}

impl OrderList {
    /// Inserts order to order book.
    pub fn insert(&mut self, order: Order) {
        match order.kind {
            OrderKind::Ask => self.asks.push(order.into()),
            OrderKind::Bid => self.bids.push(order.into()),
        }
    }
}
