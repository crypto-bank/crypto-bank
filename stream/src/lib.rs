//! crypto-bank market stream.

extern crate bincode;
extern crate cb_currency as currency;
extern crate cb_market as market;
extern crate futures;
extern crate multiqueue;
#[macro_use]
extern crate serde_derive;

use currency::Pair;
use market::{Event, Market};

/// Market stream command.
#[derive(Clone)]
pub enum Command {
    /// Subscribe command.
    Subscribe(Pair),

    /// Unsubscribe command.
    Unsubscribe(Pair),
}

/// Market stream command sender.
pub type CmdSender = ::multiqueue::BroadcastFutSender<Command>;

/// Market stream command receiver.
pub type CmdReceiver = ::multiqueue::BroadcastFutReceiver<Command>;

/// Market stream events.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Events {
    /// Market identifier.
    pub market: Option<Market>,

    /// Currency pair.
    pub pair: Option<Pair>,

    /// Vector of events.
    pub events: Vec<Event>,

    /// Timestamp of market event.
    pub timestamp: i64,
}

/// Market stream event sender.
pub type EventSender = ::futures::sync::mpsc::UnboundedSender<Events>;

/// Market stream event receiver.
pub type EventReceiver = ::futures::sync::mpsc::UnboundedReceiver<Events>;
