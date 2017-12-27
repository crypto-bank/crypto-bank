
use currency::{Pair, PairExt};
use stream::Command;

/// Serializes a stream command.
pub fn serialize(cmd: Command) -> String {
    match cmd {
        Command::Subscribe(ref pair) => subscribe(pair),
        Command::Unsubscribe(ref pair) => unsubscribe(pair),
    }
}

/// Creates a `subscribe` message for a given pair.
fn subscribe(pair: &Pair) -> String {
    format!(
        "{{\"command\":\"subscribe\", \"channel\":\"{}\"}}",
        pair.join_reversed('_')
    )
}

/// Creates a `unsubscribe` message for a given pair.
fn unsubscribe(pair: &Pair) -> String {
    format!(
        "{{\"command\":\"unsubscribe\", \"channel\":\"{}\"}}",
        pair.join_reversed('_')
    )
}
