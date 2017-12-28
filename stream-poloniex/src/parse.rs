// Poloniex WebSocket stream protocol parser.

use std::convert::TryFrom;
use serde_json::Value;

use currency::{Pair, PairExt};
use market::{Event, Order, OrderBook, OrderKind, Trade};
use util::OptionExt;
use util::parse::*;

use super::Message;
use super::errors::*;

/// Parses Poloniex WebSocket message.
pub fn parse_message(text: &str) -> Result<Option<Message>> {
    let msg = ::serde_json::from_str::<Value>(text)?;
    parse_value(&msg)
}

pub fn parse_value(msg: &Value) -> Result<Option<Message>> {
    if msg.as_array().into_result()?.len() <= 2 {
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
fn parse_order_book(event: &Value) -> Result<OrderBook> {
    // Parse currency pair
    let pair = get_str(event, "currencyPair")?;
    let pair = Pair::parse_reversed(pair)?;

    // Get books from event
    let books = get_array(event, "orderBook")?;
    let asks = get_object(books, 0)?;
    let bids = get_object(books, 1)?;

    // Create vector of orders
    let mut book = OrderBook {
        asks: Vec::with_capacity(asks.len()),
        bids: Vec::with_capacity(bids.len()),
        pair: Some(pair),
    };

    // Parse ASK order side of the book
    for (ref rate, ref volume) in asks.iter() {
        book.insert(Order {
            kind: OrderKind::Ask,
            rate: rate.as_str().parse::<f32>()?,
            volume: parse_str::<f32>(volume)?,
            total: None,
        });
    }

    // Parse BID order side of the book
    for (ref rate, ref volume) in bids.iter() {
        book.insert(Order {
            kind: OrderKind::Bid,
            rate: rate.as_str().parse::<f32>()?,
            volume: parse_str::<f32>(volume)?,
            total: None,
        });
    }

    Ok(book)
}

/// Parses order event.
fn parse_order(event: &Value) -> Result<Order> {
    Ok(Order {
        kind: OrderKind::try_from(get_i64(event, 1)?)?,
        rate: parse_nth_str::<f32>(event, 2)?,
        volume: parse_nth_str::<f32>(event, 3)?,
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
            volume: parse_nth_str::<f32>(event, 4)?,
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
            volume: 1788.27536750,
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
