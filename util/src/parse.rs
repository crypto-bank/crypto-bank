//! WebSocket JSON messages parsing utilities.
//! TODO: This is too inconsistent API,
//!       before implementing BitFinex.

use std::str::FromStr;
use std::convert::From;
use serde_json::Value;
use serde_json::value::Index;

use super::OptionExt;
use super::errors::*;

#[inline]
pub fn get_array<'a, I: Index>(event: &'a Value, index: I) -> Result<&'a Vec<Value>> {
    let event = event.get(index).into_result()?;
    let event = event.as_array().into_result()?;
    Ok(event)
}

#[inline]
pub fn get_object<'a>(
    objects: &'a Vec<Value>,
    index: usize,
) -> Result<&'a ::serde_json::Map<String, Value>> {
    let object = objects.get(index).into_result()?;
    let object = object.as_object().into_result()?;
    Ok(object)
}

#[inline]
pub fn get_i64<I: Index>(event: &Value, index: I) -> Result<i64> {
    let event = event.get(index).into_result()?;
    let event = event.as_i64().into_result()?;
    Ok(event)
}

#[inline]
pub fn get_str<'a, I: Index>(event: &'a Value, index: I) -> Result<&'a str> {
    let event = event.get(index).into_result()?;
    let event = event.as_str().into_result()?;
    Ok(event)
}

#[inline]
pub fn parse_nth_str<T: FromStr>(event: &Value, index: usize) -> Result<T>
where
    Error: From<<T as FromStr>::Err>,
{
    match event.get(index) {
        Some(value) => parse_str::<T>(value),
        None => Err(ErrorKind::EmptyOption.into()),
    }
}

#[inline]
pub fn parse_str<T: FromStr>(value: &Value) -> Result<T>
where
    Error: From<<T as FromStr>::Err>,
{
    match value.as_str() {
        Some(value) => value.parse::<T>().map_err(|e| e.into()),
        None => Err(ErrorKind::EmptyOption.into()),
    }
}
