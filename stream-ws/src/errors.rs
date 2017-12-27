//! WebSocket stream error kinds.

/// WebSocket error type.
pub type Error = ::websocket::result::WebSocketError;

/// Future with core error type.
pub type Future<T> = ::futures::Future<Item = T, Error = Error>;

/// Boxed future with core error type.
pub type BoxFuture<T> = Box<Future<T>>;
