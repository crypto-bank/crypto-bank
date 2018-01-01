
use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::collections::BTreeMap;

use ordered_float::OrderedFloat;

use currency::{Pair};
use market::{Order, OrderKind};

/// Order book for one side of orders.
#[derive(Debug)]
pub struct OrderMap {
    inner: BTreeMap<OrderedFloat<f64>, OrderedFloat<f64>>,
}

impl OrderMap {
    pub fn append(&mut self, other: &mut OrderMap) {
        self.inner.append(&mut other.inner);
    }
}

impl Default for OrderMap {
    fn default() -> Self {
        OrderMap {
            inner: BTreeMap::new(),
        }
    }
}
