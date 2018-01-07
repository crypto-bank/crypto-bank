//! ZeroMQ market events market listening.

#![feature(try_from)]

extern crate zmq;
extern crate futures;
extern crate serde_json;

extern crate cb_market as market;


use std::thread;
use std::time::Duration;
use std::convert::TryFrom;

use futures::sync::mpsc::UnboundedSender;

use market::Events;

/// Starts ZeroMQ consumer on an address.
/// TODO: Panics when anything goes wrong.
pub fn start_consumer(addr: &str, sender: UnboundedSender<Events>) {
    let context = zmq::Context::new();

    // Connect to task ventilator
    let receiver = context.socket(zmq::PULL).unwrap();
    assert!(receiver.bind(addr).is_ok());

    // Process messages from both sockets
    // We prioritize traffic from the task ventilator
    let mut msg = zmq::Message::new();
    loop {
        assert!(receiver.recv(&mut msg, 0).is_ok());

        let body = msg.as_str().unwrap();
        let events: market::Events = serde_json::from_str(body).unwrap();
   
        sender.unbounded_send(events).unwrap();
    }
}
