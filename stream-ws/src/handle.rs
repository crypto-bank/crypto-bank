//! WebSocket stream client utilities.

use std::collections::HashMap;
use tokio_core::reactor;

use currency::Pair;
use stream::{CmdReceiver, EventSender};

/// WebSocket Stream connection handle.
pub struct Handle {
    pub reactor: reactor::Handle,
    pub sender: EventSender,
    pub commands: CmdReceiver,
    pub pairs: HashMap<i64, Pair>,
}

impl Handle {
    /// Creates new connection struct.
    pub fn new(sender: EventSender, commands: CmdReceiver, handle: reactor::Handle) -> Self {
        Handle {
            reactor: handle,
            sender: sender,
            commands: commands,
            pairs: HashMap::new(),
        }
    }

    /// Returns currency pair by channel id.
    pub fn get_pair(&self, id: &i64) -> Option<Pair> {
        match self.pairs.get(&id) {
            Some(pair) => Some(pair.clone()),
            None => None,
        }
    }

    /// Creates handle with new channel.
    pub fn with_channel(mut self, id: i64, pair: Pair) -> Self {
        self.pairs.insert(id, pair);
        self
    }
}
