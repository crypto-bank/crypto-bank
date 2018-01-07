//! crypto-bank market data.

#![feature(test, try_from)]

extern crate futures;
extern crate bincode;
extern crate ordered_float;
#[macro_use]
extern crate error_chain;
#[macro_use]
extern crate serde_derive;
extern crate test;

extern crate util;

mod books;
pub mod errors;
mod events;
mod market;
mod order;
mod trade;
mod pairs;
mod symbols;

pub use self::books::*;
pub use self::events::*;
pub use self::market::*;
pub use self::order::*;
pub use self::pairs::*;
pub use self::symbols::*;
pub use self::trade::*;
