//! WebSocket stream message.

use market::Event;

/// Parsed WebSocket stream message.
pub struct Message {
    /// Sequence ID. This field is optional.
    pub seq_id: i64,
    /// WebSocket channel ID.
    pub chan_id: i64,
    /// Parsed message events.
    pub events: Vec<Event>,
}

impl Default for Message {
    fn default() -> Self {
        Message {
            seq_id: 0,
            chan_id: 0,
            events: vec![Event::HeartBeat],
        }
    }
}
