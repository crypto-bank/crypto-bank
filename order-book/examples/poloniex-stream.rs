//! Poloniex stream example.

#![feature(try_from)]

extern crate cb_currency as currency;
extern crate cb_market_data as market;
extern crate cb_stream as stream;
extern crate cb_stream_poloniex as poloniex;
extern crate cb_stream_ws as ws;
extern crate cb_util as util;

extern crate env_logger;
extern crate futures;
extern crate multiqueue;
extern crate tokio_core;

use std::convert::TryFrom;

// use sled::{Log};
use futures::prelude::*;
use currency::Pair;
use market::Event;

use tokio_core::reactor;

/// #TST-market-stream-ws
fn main() {
    env_logger::init().unwrap();

    let mut core = reactor::Core::new().unwrap();

    let (event_sender, event_receiver) = ::futures::sync::mpsc::unbounded();
    let (cmd_sender, cmd_receiver) = ::multiqueue::broadcast_fut_queue(10248);

    // parse currency pair
    let pair = Pair::try_from("XRP_BTC").unwrap();

    // send subscribe command
    cmd_sender
        .try_send(::stream::Command::Subscribe(pair.clone()))
        .unwrap();

    let handle = ::ws::Handle::new(event_sender, cmd_receiver, core.handle());
    let conn = ::ws::connect::<::poloniex::Protocol>(handle);

    let reader = event_receiver.for_each(move |ev| {
        let timestamp = ev.timestamp.unwrap();
        for e in ev.events {
            match e {
                Event::Order(o) => println!(
                    "{} Order {:?} {}/{}",
                    timestamp,
                    o.kind,
                    o.rate,
                    o.volume
                ),
                Event::Trade(t) => println!(
                    "{} Trade {:?} {}/{}",
                    timestamp,
                    t.order.kind,
                    t.order.rate,
                    t.order.volume
                ),
                Event::OrderBook(ref book) => {
                    println!("{} orderbook@{:?}", timestamp, book.pair)
                },
                Event::HeartBeat => println!("{} heartbeat", timestamp),
            }
        }

        Ok(())
    });

    // spawn event reader
    core.handle().spawn(reader);

    // spawn connection
    core.run(conn).ok();
}
