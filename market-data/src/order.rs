
use super::errors;
use std::convert::TryFrom;

/// Order kind can be either `Ask` when we are selling
/// or a `Bid` when we are trying to buy something.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub enum OrderKind {
    /// Ask or a sell.
    Ask,
    /// Bid or a buy.
    Bid,
}

/// Currency order details.
///
/// It's format used in databases and streams,
/// in places where  currency pair is always known.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Order {
    /// Order kind, which is an `Ask` or a `Bid`.
    pub kind: OrderKind,
    /// Price rate is a price of a unit.
    pub rate: f32,
    /// Order volume.
    pub volume: f32,
    /// Order total value.
    pub total: Option<f32>,
}

impl Order {
    /// Gets total order value from struct.
    /// It is calculated if `total` contains `None` value.
    pub fn get_total(&self) -> f32 {
        match self.total {
            Some(total) => total,
            None => self.rate * self.volume,
        }
    }

    /// Sets calculated total value.
    pub fn calculate_total(&mut self) -> &Self {
        self.total = Some(self.rate * self.volume);
        self
    }
}

/// Tries to convert from integer to `OrderKind`.
/// Ask is `0` and Bid is `1.
impl TryFrom<i64> for OrderKind {
    type Error = errors::Error;

    fn try_from(k: i64) -> Result<Self, Self::Error> {
        match k {
            0 => Ok(OrderKind::Ask),
            1 => Ok(OrderKind::Bid),
            _ => Err(errors::ErrorKind::InvalidOrderKind(k).into()),
        }
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;
    use bincode::{deserialize, serialize, Infinite};

    fn create_order() -> Order {
        Order {
            kind: OrderKind::Bid,
            rate: 0.00002789,
            volume: 1788.27536750,
            total: None,
        }
    }

    #[bench]
    fn serialize_order(b: &mut Bencher) {
        b.iter(|| serialize(&create_order(), Infinite).unwrap());
    }

    #[bench]
    fn deserialize_order(b: &mut Bencher) {
        let body = serialize(&create_order(), Infinite).unwrap();
        b.iter(|| deserialize::<Order>(&body).unwrap());
    }

    #[test]
    fn size_order() {
        let o = &create_order();
        let body = serialize(o, Infinite).unwrap();
        println!("order size: {:?}", body.len());
    }
}
