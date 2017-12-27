// Currency pairs utilities.

use std::fmt;
use std::fmt::{Debug, Display, Formatter};
use std::convert::TryFrom;

use super::Symbol;
use super::errors::*;

/// Currency pair.
#[derive(Serialize, Deserialize, PartialEq, Clone)]
pub struct Pair {
    pub quote: Symbol,
    pub base: Symbol,
}

/// Pair extension.
pub trait PairExt {
    /// Joins pair with given separator.
    fn join<S: Display>(&self, sep: S) -> String;

    /// Joins reversed pair with given separator.
    fn join_reversed<S: Display>(&self, sep: S) -> String;

    /// Parses a currency pair with `_` separator and reversed.
    /// Quote and base are reversed in Poloniex APIs
    /// If you are looking for `parse` method see `TryFrom`.
    fn parse_reversed(s: &str) -> Result<Pair>;
}

/// Pair extension implementatino for Pair.
impl PairExt for Pair {
    /// Joins pair with given separator.
    fn join<S: Display>(&self, sep: S) -> String {
        join_pair(self, sep)
    }

    /// Joins reversed pair with given separator.
    fn join_reversed<S: Display>(&self, sep: S) -> String {
        join_pair_reversed(self, sep)
    }

    /// Parses a currency pair with `_` separator and reversed.
    /// Note: Quote and base are reversed in Poloniex APIs
    fn parse_reversed(s: &str) -> Result<Pair> {
        parse_pair_reversed(s)
    }
}

/// Formats currency pair for display.
impl Debug for Pair {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        write!(f, "{:?}_{:?}", self.quote, self.base)
    }
}

/// Tries to convert currency pair from string.
impl<'a> TryFrom<&'a str> for Pair {
    type Error = Error;

    fn try_from(pair: &str) -> ::std::result::Result<Self, Self::Error> {
        parse_pair(pair)
    }
}

/// Joins pair with given separator.
fn join_pair<S: Display>(pair: &Pair, sep: S) -> String {
    format!("{:?}{}{:?}", pair.quote, sep, pair.base)
}

/// Joins pair with given separator.
fn join_pair_reversed<S: Display>(pair: &Pair, sep: S) -> String {
    format!("{:?}{}{:?}", pair.base, sep, pair.quote)
}

/// Parses a currency pair with `_` separator.
fn parse_pair(s: &str) -> Result<Pair> {
    let (quote, base) = parse_quote_base(s)?;
    Ok(Pair {
        quote: Symbol::try_from(quote)?,
        base: Symbol::try_from(base)?,
    })
}

/// Parses a currency pair with `_` separator and reversed.
fn parse_pair_reversed(s: &str) -> Result<Pair> {
    // NOTE: reversed output
    let (base, quote) = parse_quote_base(s)?;
    Ok(Pair {
        quote: Symbol::try_from(quote)?,
        base: Symbol::try_from(base)?,
    })
}

fn parse_quote_base(s: &str) -> Result<(&str, &str)> {
    let v = s.split('_').collect::<Vec<&str>>();
    if v.len() != 2 {
        return Err(ErrorKind::InvalidPair(s.to_string()).into());
    }
    let quote = v.get(0).unwrap();
    let base = v.get(1).unwrap();
    Ok((*quote, *base))
}

#[test]
fn parse_and_join() {
    let pair = parse_pair("XRP_BTC").unwrap();
    let revp = parse_pair_reversed("BTC_XRP").unwrap();
    assert_eq!(pair, revp);
    assert_eq!(join_pair(&pair, '_'), "XRP_BTC");
    assert_eq!(join_pair(&pair, ""), "XRPBTC");
    assert_eq!(join_pair_reversed(&pair, '_'), "BTC_XRP");
}
