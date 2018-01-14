
use std::collections::BTreeMap;

use ordered_float::OrderedFloat;

use super::{CurrencyPair, Order, OrderKind, SimpleOrder};

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

/// Order book for one side of orders.
#[derive(Debug, Clone)]
pub struct OrderMap {
    pub inner: BTreeMap<OrderedFloat<f32>, OrderedFloat<f32>>,
}

impl OrderMap {
    /// Creates a new order map.
    pub fn new() -> Self {
        OrderMap {
            inner: BTreeMap::new(),
        }
    }

    /// Inserts order amount at rate.
    pub fn insert(&mut self, order: SimpleOrder) {
        self.inner.insert(OrderedFloat(order.rate), OrderedFloat(order.amount));
    }

    /// Appends to self from another order map.
    pub fn append(&mut self, other: &mut OrderMap) {
        self.inner.append(&mut other.inner);
    }
}

impl From<Vec<SimpleOrder>> for OrderMap {
    fn from(input: Vec<SimpleOrder>) -> Self {
        let mut book = OrderMap::new();
        for order in input.into_iter() {
            book.insert(order);
        }
        book
    }
}

impl From<OrderMap> for Vec<SimpleOrder> {
    fn from(input: OrderMap) -> Self {
        let mut vec = Vec::new();
        for (rate, amount) in input.inner.into_iter() {
            vec.push(SimpleOrder {
                rate:   *rate,
                amount: *amount,
            });
        }
        vec
    }
}

/// Order books for both ask and bid orders.
#[derive(Debug, Clone)]
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
            asks: OrderMap::new(),
            bids: OrderMap::new(),
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

impl From<OrderList> for OrderBooks {
    fn from(book: OrderList) -> Self {
        OrderBooks {
            pair: book.pair,
            asks: book.asks.into(),
            bids: book.bids.into(),
        }
    }
}

impl From<OrderBooks> for OrderList {
    fn from(book: OrderBooks) -> Self {
        OrderList {
            pair: book.pair,
            asks: book.asks.into(),
            bids: book.bids.into(),
        }
    }
}
