
use super::Order;
use std::cmp::Ordering;

/// Currency trade details.
///
/// It's format used in databases and streams,
/// in places where  currency pair is always known.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Trade {
    /// Trade ID, unique only for a market.
    pub id: u32,
    /// Trade order.
    pub order: Order,
    /// Trade timestamp.
    pub timestamp: u64,
}

impl PartialOrd for Trade {
    fn partial_cmp(&self, other : &Trade) -> Option<Ordering> {
        if self.timestamp > other.timestamp {
            Some(Ordering::Greater)
        } else if self.timestamp == other.timestamp {
            Some(Ordering::Equal)
        } else {
            Some(Ordering::Less)
        }
    }
}

impl Ord for Trade {
    fn cmp(&self, other: &Trade) -> Ordering {
        self.partial_cmp(other).unwrap()
    }
}

impl Eq for Trade {}
