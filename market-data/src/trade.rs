
use super::Order;
use std::cmp::Ordering;

/// Currency trade details.
///
/// It's format used in databases and streams,
/// in places where  currency pair is always known.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Trade {
    /// Trade ID, unique only for a market.
    pub id: i64,
    /// Trade order.
    pub order: Order,
    /// Trade timestamp.
    pub timestamp: i64,
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


#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;
    use bincode::{deserialize, serialize, Infinite};

    fn create_trade() -> Trade {
        Trade {
            id: 14179278,
            order: Order {
                kind: OrderKind::Bid,
                rate: 0.00002789,
                volume: 1788.27536750,
                total: None,
            },
            timestamp: 1509576585,
        }
    }

    #[bench]
    fn serialize_trade(b: &mut Bencher) {
        b.iter(|| serialize(&create_trade(), Infinite).unwrap());
    }

    #[bench]
    fn deserialize_trade(b: &mut Bencher) {
        let body = serialize(&create_trade(), Infinite).unwrap();
        b.iter(|| deserialize::<Trade>(&body).unwrap());
    }

    #[bench]
    fn serdeser_trade(b: &mut Bencher) {
        let t = &create_trade();
        b.iter(|| {
            let body = serialize(t, Infinite).unwrap();
            let _trade: Trade = deserialize(&body).unwrap();
        });
    }

    #[test]
    fn size_trade() {
        let t = &create_trade();
        let body = serialize(t, Infinite).unwrap();
        println!("trade size: {:?}", body.len());
    }
}
