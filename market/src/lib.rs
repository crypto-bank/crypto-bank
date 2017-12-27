//! crypto-bank market module.

#![feature(test, try_from)]

extern crate bincode;
extern crate cb_currency as currency;
#[macro_use]
extern crate error_chain;
#[macro_use]
extern crate serde_derive;
extern crate test;

mod event;
mod order;
mod orderbook;
mod trade;

pub mod errors;
pub use self::event::*;
pub use self::order::*;
pub use self::orderbook::*;
pub use self::trade::*;

/// Market identifiers.
#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub enum Market {
    Poloniex,
    Bitfinex,
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

    fn create_trade() -> Trade {
        Trade {
            id: 14179278,
            order: create_order(),
            timestamp: 1509576585,
        }
    }

    #[bench]
    fn serialize_order(b: &mut Bencher) {
        b.iter(|| serialize(&create_order(), Infinite).unwrap());
    }

    #[bench]
    fn serialize_trade(b: &mut Bencher) {
        b.iter(|| serialize(&create_trade(), Infinite).unwrap());
    }

    #[bench]
    fn deserialize_order(b: &mut Bencher) {
        let body = serialize(&create_order(), Infinite).unwrap();
        b.iter(|| deserialize::<Order>(&body).unwrap());
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
        println!("size: {:?}", body.len());
    }
}
