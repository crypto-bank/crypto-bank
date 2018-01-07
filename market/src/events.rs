//! crypto-bank stream event.

use super::{CurrencyPair, Order, Trade, Market, OrderList};

/// Event in a currency pair market.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub enum Event {
    /// Single trade.
    Trade(Trade),

    /// Single order book change.
    Order(Order),

    /// Full order books update.
    OrderBook(OrderList),

    /// Heart beat.
    HeartBeat,
}

/// Market stream events.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Events {
    /// Market identifier.
    pub market: Market,

    /// Currency pair.
    pub pair: Option<CurrencyPair>,

    /// Vector of events.
    pub events: Vec<Event>,

    /// Sequence number.
    pub seq: Option<i64>,

    /// Timestamp of market event.
    pub timestamp: Option<i64>,
}

/// Market stream event sender.
pub type EventSender = ::futures::sync::mpsc::UnboundedSender<Events>;

/// Market stream event receiver.
pub type EventReceiver = ::futures::sync::mpsc::UnboundedReceiver<Events>;

/// Events extension.
pub trait EventExt {
    /// Returns true if event is heartbeat.
    fn is_heart_beat(&self) -> bool;    
    /// Returns true if event is orderbook.
    fn is_order_book(&self) -> bool;
}

impl EventExt for Event {
    fn is_heart_beat(&self) -> bool {
        match self {
            &Event::HeartBeat => true,
            _ => false,
        }
    }

    fn is_order_book(&self) -> bool {
        match self {
            &Event::OrderBook(_) => true,
            _ => false,
        }
    }
}

impl EventExt for Events {
    fn is_heart_beat(&self) -> bool {
        match self.events.len() {
            1 => self.events[0].is_heart_beat(),
            _ => false,
        }
    }

    fn is_order_book(&self) -> bool {
        match self.events.len() {
            1 => self.events[0].is_order_book(),
            _ => false,
        }
    }
}

impl EventExt for Vec<Event> {
    fn is_heart_beat(&self) -> bool {
        match self.len() {
            1 => self[0].is_heart_beat(),
            _ => false,
        }
    }

    fn is_order_book(&self) -> bool {
        match self.len() {
            1 => self[0].is_order_book(),
            _ => false,
        }
    }
}
