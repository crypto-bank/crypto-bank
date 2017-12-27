
use super::{Order, OrderKind};
use currency::Pair;

/// Market order book.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct OrderBook {
    /// Currency pair.
    pub pair: Option<Pair>,
    /// List of asks.
    pub asks: Vec<Order>,
    /// List of bids.
    pub bids: Vec<Order>,
}

impl OrderBook {
    // TODO: removing on `order.amount == 0`.
    /// Inserts order to order book.
    pub fn insert(&mut self, order: Order) {
        match order.kind {
            OrderKind::Ask => self.asks.push(order),
            OrderKind::Bid => self.bids.push(order),
        }
    }
}
