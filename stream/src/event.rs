//! Market stream event.

/// Market stream events.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Events {
    /// Sequence number.
    pub seq: Option<i64>,

    /// Market identifier.
    pub market: ::market::MarketId,

    /// Currency pair.
    pub pair: Option<::currency::Pair>,

    /// Vector of events.
    pub events: Vec<::market::Event>,

    /// Timestamp of market event.
    pub timestamp: Option<i64>,
}

/// Market stream event sender.
pub type EventSender = ::futures::sync::mpsc::UnboundedSender<Events>;

/// Market stream event receiver.
pub type EventReceiver = ::futures::sync::mpsc::UnboundedReceiver<Events>;
