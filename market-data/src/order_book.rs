
use currency::Pair;
use super::{Order, OrderKind};

/// Market order book.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct OrderBook {
    pub pair: Option<Pair>,
    pub asks: Vec<Order>,
    pub bids: Vec<Order>,
}

impl OrderBook {
    /// Inserts order to order book.
    pub fn insert(&mut self, order: Order) {
        match order.kind {
            OrderKind::Ask => self.asks.push(order),
            OrderKind::Bid => self.bids.push(order),
        }
    }
}
