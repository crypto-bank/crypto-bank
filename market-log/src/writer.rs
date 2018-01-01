//! Orca events log.

extern crate cb_currency as currency;
extern crate cb_market as market;
extern crate cb_market_event as event;
extern crate cb_util as util;

use core::errors::*;
use event::MarketEvent;

/// History log writer.
pub trait Writer {
    /// Writes events to the log.
    /// Returns index of a written entry.
    fn write(&self, event: &MarketEvent) -> Result<u64>;
}

impl<Log: ::sled::Log> Writer for Log {
    /// Writes events to `sled::Log`.
    fn write(&self, event: &MarketEvent) -> Result<u64> {
        let body = ::bincode::serialize(event, ::bincode::Infinite)?;
        Ok(self.write(body))
    }
}
