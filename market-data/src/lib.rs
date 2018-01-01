//! crypto-bank market module.

#![feature(test, try_from)]

extern crate bincode;
extern crate cb_currency as currency;
#[macro_use]
extern crate error_chain;
#[macro_use]
extern crate serde_derive;
extern crate test;

mod event;
mod market;
mod order_book;
mod order;
mod trade;

pub mod errors;
pub use self::event::*;
pub use self::market::*;
pub use self::order_book::*;
pub use self::order::*;
pub use self::trade::*;
