// Option utilities.

use super::errors::*;

/// Option utility extensions.
pub trait OptionExt<T> {
    /// Converts Option to Result.
    fn into_result(self) -> Result<T>;
}

impl<T> OptionExt<T> for Option<T> {
    #[inline]
    fn into_result(self) -> Result<T> {
        match self {
            Some(value) => Ok(value),
            None => Err(ErrorKind::EmptyOption.into()),
        }
    }
}
