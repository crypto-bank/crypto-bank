
use std::thread;
use std::time::Duration;
use std::convert::TryFrom;


/// Starts ZeroMQ consumer on an address.
/// TODO: Panics when anything goes wrong.
pub fn start_consumer(addr: &str) {
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
        let events: stream::Events = serde_json::from_str(body).unwrap();
        
        println!("{:?}", events);
    }
}
