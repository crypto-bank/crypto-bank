//! crypto-bank WebSocket market stream.

extern crate chrono;
extern crate futures;
#[macro_use]
extern crate log;
extern crate serde_json;
extern crate tokio_core;
extern crate multiqueue;
extern crate websocket;

extern crate market;
extern crate util;

mod connect;
mod handle;

// TODO: do not expose handle, create a "builder"
pub use self::connect::*;
pub use self::handle::*;

use market::{CurrencyPair, Event, Events, Market};

/// WebSocket Stream protocol trait.
pub trait Protocol {
    /// Protocol error.
    type Error: ::std::error::Error;

    /// Returns WebSocket stream addrss.
    fn address() -> &'static str;

    /// Returns protocol market identifier.
    fn market() -> Market;

    /// Parses received WebSocket message.
    fn parse(msg: &str) -> Result<Option<Message>, Self::Error>;

    /// Serializes WebSocket command.
    fn serialize(cmd: Command) -> String;
}

/// Parsed WebSocket stream message.
pub struct Message {
    /// Sequence ID. This field is optional.
    pub seq_id: i64,

    /// WebSocket channel ID.
    pub chan_id: i64,

    /// Parsed message events.
    pub events: Vec<Event>,
}

impl Default for Message {
    fn default() -> Self {
        Message {
            seq_id: 0,
            chan_id: 0,
            events: vec![Event::HeartBeat],
        }
    }
}

/// Market stream command.
#[derive(Clone)]
pub enum Command {
    /// Subscribe command.
    Subscribe(CurrencyPair),

    /// Unsubscribe command.
    Unsubscribe(CurrencyPair),
}

/// WebSocket error type.
pub type Error = ::websocket::result::WebSocketError;

/// Future with core error type.
pub type Future<T> = ::futures::Future<Item = T, Error = Error>;

/// Boxed future with core error type.
pub type BoxFuture<T> = Box<Future<T>>;

/// Market stream command sender.
pub type CmdSender = ::multiqueue::BroadcastFutSender<Command>;

/// Market stream command receiver.
pub type CmdReceiver = ::multiqueue::BroadcastFutReceiver<Command>;

/// Market stream event sender.
pub type EventSender = ::futures::sync::mpsc::UnboundedSender<Events>;

/// Market stream event receiver.
pub type EventReceiver = ::futures::sync::mpsc::UnboundedReceiver<Events>;
