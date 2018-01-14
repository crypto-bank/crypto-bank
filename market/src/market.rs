
use std::str::FromStr;

use super::errors::*;

/// Market identifier.
#[derive(Serialize, Deserialize, Hash, Eq, PartialEq, Copy, Clone, Debug)]
pub enum Market {
    /// Poloniex.com
    Poloniex = 1,
    /// Bitfinex.com
    Bitfinex = 2,
    /// Bittrex.com
    Bittrex = 3,
    /// Binance.com
    Binance = 4,
    /// Cryptopia
    Cryptopia = 5,
}

impl FromStr for Market {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self> {
        match s {
            "Poloniex" => Ok(Market::Poloniex),
            "Bitfinex" => Ok(Market::Bitfinex),
            "Bittrex" => Ok(Market::Bittrex),
            "Binance" => Ok(Market::Binance),
            "Cryptopia" => Ok(Market::Cryptopia),
            _ => Err(ErrorKind::UnknownMarket(s.to_owned()).into()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn market_debug() {
        assert_eq!("Poloniex".to_owned(), format!("{:?}", Market::Poloniex));
    }
}
