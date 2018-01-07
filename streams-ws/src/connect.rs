//! WebSocket stream connection.

use chrono::prelude::*;
use futures::future::{self, Future, Loop};
use futures::prelude::*;
use websocket::{ClientBuilder, OwnedMessage, WebSocketError};
use websocket::async::TcpStream;
use websocket::client::async::{Client as WebSocketClient, TlsStream};

use market::{Events, Event, EventExt};
use util::{boxfuture, FutureExt};

use super::*;

/// TLS-encrypted asynchronous WebSocket stream client.
type Client = WebSocketClient<TlsStream<TcpStream>>;

/// WebSocket Stream loop state.
type LoopState = (Client, Option<Handle>);

/// WebSocket Stream loop future.
type LoopFuture = BoxFuture<Loop<(), LoopState>>;

/// Connects to WebSocket stream.
pub fn connect<P: Protocol>(handle: Handle) -> BoxFuture<()> {
    // Connect to WebSocket server
    ClientBuilder::new(P::address())
        .unwrap() // panics on address parse
        .async_connect_secure(None, &handle.reactor)
        .map(|(duplex, _)| duplex)
        .map_err(|e| e.into())
        .and_then(move |stream| {
            // Start connection stream processing loop.
            future::loop_fn((stream, Some(handle)), move |(stream, handle)| {
                // Check for subscribe commands.
                let handle = handle.unwrap();
                if let Ok(cmd) = handle.commands.try_recv() {
                    // Serialize and send commands to connection.
                    return send_cmd::<P>(cmd, stream, handle);
                }
                // Read from stream and process messages.
                // Break loop if connection was closed.
                stream
                    .into_future()
                    .or_else(|(err, stream)| close_with_err(stream, err))
                    .and_then(move |(body, stream)| match body {
                        Some(msg) => handle_message::<P>(msg, stream, handle),
                        None => break_loop(), // closed stream
                    })
                    .into_box()
            })
        })
        .into_box()
}

/// Returns future that breaks WebSocket stream loop.
fn break_loop() -> LoopFuture {
    boxfuture::ok(Loop::Break(()))
}

/// Returns future that continues WebSocket stream loop.
fn continue_loop(stream: Client, handle: Handle) -> LoopFuture {
    boxfuture::ok(Loop::Continue((stream, Some(handle))))
}

/// Parse raw websocket message.
/// It can be `Close`, `Text` or a wrong message.
fn handle_message<P: Protocol>(body: OwnedMessage, stream: Client, handle: Handle) -> LoopFuture {
    match body {
        OwnedMessage::Text(body) => handle_body::<P>(body, stream, handle),
        OwnedMessage::Close(_) => break_loop(),
        _ => {
            // we will investigate further on any
            error!("unexpected websocket message");
            break_loop()
        }
    }
}

/// Serializes an sends command to WebSocket connection.
fn send_cmd<P: Protocol>(cmd: Command, stream: Client, handle: Handle) -> LoopFuture {
    send_msg(OwnedMessage::Text(P::serialize(cmd)), stream, handle)
}

/// Closes a stream after logging an error.
fn close_with_err(
    stream: Client,
    err: WebSocketError,
) -> BoxFuture<(Option<OwnedMessage>, Client)> {
    error!("Could not receive message: {:?}", err);
    stream
        .send(OwnedMessage::Close(None))
        .map(|stream| (None, stream))
        .map_err(|e| e.into())
        .into_box()
}

/// Parses body of a `Text` WebSocket message.
/// Processes message and sends events if any.
fn handle_body<P: Protocol>(body: String, stream: Client, handle: Handle) -> LoopFuture {
    trace!("parsing msg: {}", &body);
    match P::parse(&body) {
        Ok(Some(msg)) => process_message::<P>(msg, stream, handle),
        Ok(None) => continue_loop(stream, handle), // empty message
        Err(err) => {
            error!("websocket market {:?} parse error: {}", P::market(), err);
            continue_loop(stream, handle)
        }
    }
}

/// Processes message and sends events if any.
/// Registers currency pair channel on orderbook.
fn process_message<P: Protocol>(msg: Message, stream: Client, handle: Handle) -> LoopFuture {
    // Check if event is order book
    if msg.events.is_order_book() {
        // Register new channel and send events
        return handle_orderbook::<P>(msg, stream, handle);
    }
    send_and_continue::<P>(msg, stream, handle)
}

/// Registers currency pair channel id in `Handle`.
/// Sends parsed events to handle sender.
fn handle_orderbook<P: Protocol>(msg: Message, stream: Client, handle: Handle) -> LoopFuture {
    // unwrap orderbook from msg
    let pair = match msg.events[0] {
        // NOTE: we unwrap here because if `None` it's wrong impl.
        Event::OrderBook(ref book) => book.pair.clone().unwrap(),
        _ => panic!("code was mangled?"),
    };
    // create new handle with registered channel
    let handle = handle.with_channel(msg.chan_id, pair);
    send_and_continue::<P>(msg, stream, handle)
}

/// Sends message to handle sender.
fn send_and_continue<P: Protocol>(msg: Message, stream: Client, handle: Handle) -> LoopFuture {
    // get event currency pair from handle
    let pair = match handle.get_pair(&msg.chan_id) {
        Some(pair) => Some(pair),
        None => {
            // log an error if not heart beat
            if msg.chan_id != 0 {
                error!(
                    "message on unknown channel, market: {:?} chan: {:?}",
                    P::market(),
                    msg.chan_id
                );
                return continue_loop(stream, handle);
            }
            None
        }
    };
    // create stream events struct
    let events = Events {
        seq: None,
        market: P::market(),
        pair: pair,
        events: msg.events,
        timestamp: Some(UTC::now().timestamp()),
    };
    // send events
    handle.sender.unbounded_send(events).unwrap();
    // continue loop with registered pair
    continue_loop(stream, handle)
}

/// Sends message to a WebSocket stream and continues loop.
fn send_msg(msg: OwnedMessage, stream: Client, handle: Handle) -> LoopFuture {
    stream
        .send(msg)
        .map(|stream| Loop::Continue((stream, Some(handle))))
        .map_err(|e| e.into())
        .into_box()
}
