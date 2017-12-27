//! Crypto currency symbols and pairs utilites.

#![feature(try_from)]

extern crate bincode;
#[macro_use]
extern crate error_chain;
#[macro_use]
extern crate serde_derive;

mod pairs;
mod symbols;
pub use self::pairs::*;
pub use self::symbols::*;

pub mod errors {
    error_chain! {
        errors {
            // Currency
            UnknownCurrency(symbol: String) {
                description("unknown currency symbol")
                display("unknown currency symbol: {}", symbol)
            }
            // Currency pair
            InvalidPair(pair: String) {
                description("unknown currency pair")
                display("unknown currency pair: {}", pair)
            }
        }
    }
}
