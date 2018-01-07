
/// Market identifier.
#[derive(Serialize, Deserialize, Hash, Eq, PartialEq, Clone, Debug)]
pub enum Market {
    /// Poloniex.com
    Poloniex = 1,
    /// Bitfinex.com
    Bitfinex = 2,
    /// Bittrex.com
    Bittrex = 3,
    /// Binance.com
    Binance = 4,
}

#[cfg(test)]
mod tests {
    #[test]
    fn market_debug() {
        assert_eq!("Poloniex".to_owned(), format!("{:?}", Market::Poloniex));
    }
}
