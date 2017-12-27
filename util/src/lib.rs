//! Orca utilities module.

#[macro_use]
extern crate error_chain;
extern crate futures;
extern crate serde_json;

mod future;
mod option;
pub mod parse;
pub mod errors;
pub use self::future::boxfuture;
pub use self::future::{BoxFuture, FutureExt};
pub use self::option::OptionExt;
