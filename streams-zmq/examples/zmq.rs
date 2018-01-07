//! ZeroMQ market events stream listening.

extern crate cb_streams_zmq as zmq;

fn main() {

    // Start zeromq consumer in a separate thread
    let rx = start_consumer("tcp://*:5558");

    // Receive events on rx
}
