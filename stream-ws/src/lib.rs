//! crypto-bank WebSocket market stream.

extern crate chrono;
extern crate cb_currency as currency;
extern crate cb_market as market;
extern crate cb_stream as stream;
extern crate cb_util as util;
extern crate futures;
#[macro_use]
extern crate log;
extern crate serde_json;
extern crate tokio_core;
extern crate websocket;

mod connect;
pub mod errors;
mod handle;
mod msg;

// TODO: do not expose handle, create a "builder"
pub use self::connect::connect;
pub use self::handle::Handle;
pub use self::msg::Message;

use market::Market;
use stream::Command;

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
