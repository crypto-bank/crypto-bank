
error_chain! {
    errors {
        InvalidPair(pair: String) {
            description("unknown currency pair")
            display("unknown currency pair: {}", pair)
        }
        InvalidOrderKind(k: i64) {
            description("invalid order kind")
            display("invalid order kind: {}", k)
        }
        UnknownCurrency(symbol: String) {
            description("unknown currency symbol")
            display("unknown currency symbol: {}", symbol)
        }
    }
}
