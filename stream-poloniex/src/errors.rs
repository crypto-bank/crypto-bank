//! Poloniex WebSocket stream error kinds.

error_chain! {
    foreign_links {
        UtilError(::util::errors::Error);
        DeserializeError(::serde_json::Error);
        ParseIntError(::std::num::ParseIntError);
        ParseFloatError(::std::num::ParseFloatError);
    }

    links {
        Currency(::currency::errors::Error, ::currency::errors::ErrorKind);
        Market(::market::errors::Error, ::market::errors::ErrorKind);
    }

    errors {
        UnexpectedEvent(t: String) {
            description("unexpected event")
            display("unexpected event: {}", t)
        }
    }
}

/// Future with core error type.
pub type Future<T> = ::futures::Future<Item = T, Error = Error>;

/// Boxed future with core error type.
pub type BoxFuture<T> = Box<Future<T>>;
