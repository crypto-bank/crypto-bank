//! Utilities errors kinds.

error_chain! {
    foreign_links {
        ParseIntError(::std::num::ParseIntError);
        ParseFloatError(::std::num::ParseFloatError);
    }

    errors {
        EmptyOption {
            description("unwrapped empty option")
        }
    }
}

/// Future with core error type.
pub type Future<T> = ::futures::Future<Item = T, Error = Error>;

/// Boxed future with core error type.
pub type BoxFuture<T> = Box<Future<T>>;
