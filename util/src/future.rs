// Future utilities.

use futures::Future;

/// Boxed future.
pub type BoxFuture<Item, Error> = Box<Future<Item = Item, Error = Error>>;

/// Future utility extensions.
pub trait FutureExt: Future + Sized {
    /// Boxes a future.
    fn into_box(self) -> Box<Future<Item = Self::Item, Error = Self::Error>>;
}

impl<T: Future + 'static> FutureExt for T {
    fn into_box(self) -> Box<Future<Item = Self::Item, Error = Self::Error>> {
        Box::new(self)
    }
}

pub mod boxfuture {
    use futures::future;
    use futures::future::FutureResult;

    /// Creates a boxed future result.
    pub fn ok<T, E>(t: T) -> Box<FutureResult<T, E>> {
        Box::new(future::ok(t))
    }
}
