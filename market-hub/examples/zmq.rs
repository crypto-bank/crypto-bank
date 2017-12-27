
extern crate zmq;

use std::time::Duration;
use std::thread;

fn main() {
    let context = zmq::Context::new();

    // Connect to task ventilator
    let receiver = context.socket(zmq::PULL).unwrap();
    assert!(receiver.bind("tcp://*:5558").is_ok());


    println!("looping");

    // Process messages from both sockets
    // We prioritize traffic from the task ventilator
    let mut msg = zmq::Message::new();
    loop {
        assert!(receiver.recv(&mut msg, 0).is_ok());

        println!("ok: {:?}", msg.as_str().unwrap());

        // No activity, so sleep for 1 msec
        thread::sleep(Duration::from_millis(1))
    }
}
