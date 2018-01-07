//! Poloniex stream example.

#![feature(try_from)]

extern crate market;
extern crate stream_poloniex as poloniex;
extern crate streams_ws as ws;
extern crate util;

extern crate env_logger;
extern crate futures;
extern crate multiqueue;
extern crate tokio_core;
extern crate serde_json;

use std::convert::TryFrom;

use futures::prelude::*;
use tokio_core::reactor;

use market::{CurrencyPair, Event, EventExt};

/// #TST-market-stream-ws
fn main() {
    env_logger::init().unwrap();

    let mut core = reactor::Core::new().unwrap();

    let (event_sender, event_receiver) = ::futures::sync::mpsc::unbounded();
    let (cmd_sender, cmd_receiver) = ::multiqueue::broadcast_fut_queue(10248);

    // parse currency pair
    let pair = CurrencyPair::try_from("ETH_BTC").unwrap();

    // send subscribe command
    cmd_sender
        .try_send(::ws::Command::Subscribe(pair.clone()))
        .unwrap();

    let handle = ::ws::Handle::new(event_sender, cmd_receiver, core.handle());
    let conn = ::ws::connect::<::poloniex::Protocol>(handle);

    let reader = event_receiver.for_each(move |ev| {
        if ev.is_heart_beat() {
            println!("heartbeat");
            return Ok(());
        }

        println!("event received");
        let pair = ev.pair.expect("Event currency pair");
        let timestamp = ev.timestamp.expect("Event timestamp");
        for e in ev.events {
            match e {
                Event::Order(o) => println!(
                    "{:?} {:?} {} Order {:?} {}/{}",
                    ev.market, pair,
                    timestamp,
                    o.kind,
                    o.rate,
                    o.amount
                ),
                Event::Trade(t) => println!(
                    "{:?} {:?} {} Trade {:?} {}/{}",
                    ev.market, pair,
                    timestamp,
                    t.order.kind,
                    t.order.rate,
                    t.order.amount
                ),
                Event::OrderBook(ref book) => {
                    println!("{}", ::serde_json::to_string(book).unwrap());
                    println!("{:?} {:?} {} orderbook@{:?}", ev.market, pair, timestamp, book.pair)
                },
                Event::HeartBeat => println!("{:?} {:?} {} heartbeat", ev.market, pair, timestamp),
            }
        }

        Ok(())
    });

    // spawn event reader
    core.handle().spawn(reader);

    // spawn connection
    core.run(conn.map_err(|e| {
        println!("error: {:?}", e);
    }).map(|_| {
        println!("connection done");
    })).ok();
}
