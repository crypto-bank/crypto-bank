//! Poloniex WebSocket stream.

#![feature(test, try_from)]

extern crate cb_currency as currency;
extern crate cb_market as market;
extern crate cb_stream as stream;
extern crate cb_stream_ws as ws;
extern crate cb_util as util;
#[macro_use]
extern crate error_chain;
extern crate futures;
extern crate serde_json;
extern crate test;

pub mod errors;
mod parse;
mod serialize;

use market::Market;
use stream::Command;
use ws::Message;

use self::errors::Error;
use self::parse::parse_message;
use self::serialize::serialize;

/// Poloniex WebSocket protocol.
pub struct Protocol;

// Implementation of Poloniex WebSocket protocol.
impl ws::Protocol for Protocol {
    /// Protocol error.
    type Error = Error;

    /// Returns `Poloniex` WebSocket stream address.
    fn address() -> &'static str {
        "wss://api2.poloniex.com:443"
    }

    /// Returns `Poloniex` market identifier.
    fn market() -> Market {
        Market::Poloniex
    }

    /// Parses received WebSocket message.
    fn parse(msg: &str) -> Result<Option<Message>, Self::Error> {
        parse_message(msg).map_err(|e| e.into())
    }

    /// Serializes WebSocket command.
    fn serialize(cmd: Command) -> String {
        serialize(cmd)
    }
}
