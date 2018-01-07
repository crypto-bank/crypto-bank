//! Poloniex WebSocket stream.

#![feature(test, try_from)]

extern crate market;
extern crate streams_ws as stream;
extern crate util;
#[macro_use]
extern crate error_chain;
extern crate futures;
extern crate serde_json;
extern crate test;

use std::convert::TryFrom;
use serde_json::Value;

use market::*;
use util::OptionExt;
use util::parse::*;
use stream::{Command, Message};

/// Poloniex WebSocket protocol.
pub struct Protocol;

// Implementation of Poloniex WebSocket protocol.
impl stream::Protocol for Protocol {
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
    fn parse(msg: &str) -> Result<Option<Message>> {
        parse_message(msg).map_err(|e| e.into())
    }

    /// Serializes WebSocket command.
    fn serialize(cmd: Command) -> String {
        serialize(cmd)
    }
}

error_chain! {
    foreign_links {
        UtilError(::util::errors::Error);
        DeserializeError(::serde_json::Error);
        ParseIntError(::std::num::ParseIntError);
        ParseFloatError(::std::num::ParseFloatError);
    }

    links {
        Market(::market::errors::Error, ::market::errors::ErrorKind);
    }

    errors {
        UnexpectedEvent(t: String) {
            description("unexpected event")
            display("unexpected event: {}", t)
        }
    }
}

/// Future with core error type.
pub type Future<T> = ::futures::Future<Item = T, Error = Error>;

/// Boxed future with core error type.
pub type BoxFuture<T> = Box<Future<T>>;

/// Serializes a stream command.
fn serialize(cmd: Command) -> String {
    match cmd {
        Command::Subscribe(ref pair) => subscribe(pair),
        Command::Unsubscribe(ref pair) => unsubscribe(pair),
    }
}

/// Creates a `subscribe` message for a given pair.
fn subscribe(pair: &CurrencyPair) -> String {
    format!(
        "{{\"command\":\"subscribe\", \"channel\":\"{}\"}}",
        pair.join_reversed('_')
    )
}

/// Creates a `unsubscribe` message for a given pair.
fn unsubscribe(pair: &CurrencyPair) -> String {
    format!(
        "{{\"command\":\"unsubscribe\", \"channel\":\"{}\"}}",
        pair.join_reversed('_')
    )
}


/// Parses Poloniex WebSocket message.
fn parse_message(text: &str) -> Result<Option<Message>> {
    let msg = ::serde_json::from_str::<Value>(text)?;
    parse_value(&msg)
}

fn parse_value(msg: &Value) -> Result<Option<Message>> {
    let arr = msg.as_array().into_result()?;
    if arr.len() <= 2 {
        return Ok(Some(Message::default()));
    }
    let chan_id = get_i64(&msg, 0)?;
    let seq_id = get_i64(&msg, 1)?;
    let events = get_array(&msg, 2)?;
    let mut results = Vec::with_capacity(events.len());
    for event in events {
        results.push(parse_event(event)?);
    }
    Ok(Some(Message {
        seq_id: seq_id,
        chan_id: chan_id,
        events: results,
    }))
}

/// Parses single event from Poloniex WebSocket message.
fn parse_event(event: &Value) -> Result<Event> {
    match get_str(event, 0)? {
        "t" => Ok(Event::Trade(parse_trade(event)?)),
        "o" => Ok(Event::Order(parse_order(event)?)),
        "i" => Ok(Event::OrderBook(
            parse_order_book(event.get(1).into_result()?)?,
        )),
        any => Err(ErrorKind::UnexpectedEvent(any.to_owned()).into()),
    }
}

/// Parses order book event.
fn parse_order_book(event: &Value) -> Result<OrderList> {
    // Parse currency pair
    let pair = get_str(event, "currencyPair")?;
    let pair = CurrencyPair::parse_reversed(pair)?;

    // Get books from event
    let books = get_array(event, "orderBook")?;
    let asks = get_object(books, 0)?;
    let bids = get_object(books, 1)?;

    // Create vector of orders
    let mut book = OrderList {
        asks: Vec::with_capacity(asks.len()),
        bids: Vec::with_capacity(bids.len()),
        pair: Some(pair),
    };

    // Parse ASK order side of the book
    for (ref rate, ref amount) in asks.iter() {
        book.asks.push(SimpleOrder {
            rate: rate.as_str().parse::<f32>()?,
            amount: parse_str::<f32>(amount)?,
        });
    }

    // Parse BID order side of the book
    for (ref rate, ref amount) in bids.iter() {
        book.bids.push(SimpleOrder {
            rate: rate.as_str().parse::<f32>()?,
            amount: parse_str::<f32>(amount)?,
        });
    }

    Ok(book)
}

/// Parses order event.
fn parse_order(event: &Value) -> Result<Order> {
    Ok(Order {
        kind: OrderKind::try_from(get_i64(event, 1)?)?,
        rate: parse_nth_str::<f32>(event, 2)?,
        amount: parse_nth_str::<f32>(event, 3)?,
        total: None,
    })
}

/// Parses trade event.
fn parse_trade(event: &Value) -> Result<Trade> {
    Ok(Trade {
        id: parse_nth_str::<i64>(event, 1)?,
        order: Order {
            kind: OrderKind::try_from(get_i64(event, 2)?)?,
            rate: parse_nth_str::<f32>(event, 3)?,
            amount: parse_nth_str::<f32>(event, 4)?,
            total: None,
        },
        timestamp: get_i64(event, 5)?,
    })
}


// #TST-market-stream-poloniex
// TODO: test parsing order book
#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;

    fn create_order() -> Order {
        Order {
            kind: OrderKind::Bid,
            rate: 0.00002789,
            amount: 1788.27536750,
            total: None,
        }
    }

    fn create_trade() -> Trade {
        Trade {
            id: 14179278,
            order: create_order(),
            timestamp: 1509576585,
        }
    }

    #[test]
    fn parse_test() {
        let body = "[117,103957441,[[\"o\",1,\"0.00002789\",\"1788.27536750\"], \
                    [\"t\",\"14179278\",1,\"0.00002789\",\"1788.27536750\",1509576585]]]";
        let msg = parse_message(body).unwrap().unwrap();
        assert_eq!(msg.chan_id, 117);
        assert_eq!(msg.seq_id, 103957441);
        assert_eq!(msg.events.len(), 2);
        if let &Event::Order(ref o) = msg.events.get(0).unwrap() {
            assert_eq!(o, &create_order());
        } else {
            panic!("expected order");
        }
        if let &Event::Trade(ref t) = msg.events.get(1).unwrap() {
            assert_eq!(t, &create_trade());
        } else {
            panic!("expected trade");
        }
    }

    #[bench]
    fn parse_body(b: &mut Bencher) {
        let body = "[117,103957441,[[\"o\",1,\"0.00002789\",\"1788.27536750\"]]]";
        b.iter(|| {
            parse_message(body).unwrap();
        });
    }

    #[bench]
    fn parse_body_no_json(b: &mut Bencher) {
        let body = "[117,103957441,[[\"o\",1,\"0.00002789\",\"1788.27536750\"]]]";
        let msg = &::serde_json::from_str::<Value>(body).unwrap();
        b.iter(|| {
            parse_value(msg).unwrap();
        });
    }

    #[bench]
    fn parse_body_log(b: &mut Bencher) {
        let body = "[117,103957441,[[\"o\",1,\"0.00002789\",\"1788.27536750\"]]]";
        b.iter(|| {
            trace!("parsing msg: {}", &body);
            parse_message(body).unwrap();
        });
    }

    #[bench]
    fn parse_body_two(b: &mut Bencher) {
        let body = "[117,103957441,[[\"o\",1,\"0.00002789\",\"1788.27536750\"], \
                    [\"o\",1,\"0.00002784\",\"82074.71641065\"]]]";
        b.iter(|| {
            parse_message(body).unwrap();
        });
    }
}
