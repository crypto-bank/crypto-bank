
/// Market stream command.
#[derive(Clone)]
pub enum Command {
    /// Subscribe command.
    Subscribe(::currency::Pair),

    /// Unsubscribe command.
    Unsubscribe(::currency::Pair),
}

/// Market stream command sender.
pub type CmdSender = ::multiqueue::BroadcastFutSender<Command>;

/// Market stream command receiver.
pub type CmdReceiver = ::multiqueue::BroadcastFutReceiver<Command>;
