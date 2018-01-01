
error_chain! {
    errors {
        InvalidOrderKind(k: i64) {
            description("invalid order kind")
            display("invalid order kind: {}", k)
        }
    }
}
