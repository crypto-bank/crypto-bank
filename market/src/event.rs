//! crypto-bank market event.

use super::{Order, OrderBook, Trade};

/// Event in a currency pair market.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub enum Event {
    /// Single trade.
    Trade(Trade),

    /// Single order book change.
    Order(Order),

    /// Order books reset.
    OrderBook(OrderBook),

    /// Heart beat.
    HeartBeat,
}

/// Events extension.
pub trait EventExt {
    /// Returns true if event is orderbook.
    fn has_order_book(&self) -> bool;
}

impl EventExt for Event {
    /// Returns true if event is orderbook.
    fn has_order_book(&self) -> bool {
        match self {
            &Event::OrderBook(_) => true,
            _ => false,
        }
    }
}

impl EventExt for Vec<Event> {
    /// Returns true if vector size is `1` and first event is orderbook.
    fn has_order_book(&self) -> bool {
        match self.len() {
            1 => self[0].has_order_book(),
            _ => false,
        }
    }
}
