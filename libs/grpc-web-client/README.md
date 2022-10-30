# grpc-web-client

[![Crates.io](https://img.shields.io/crates/v/grpc-web-client)](https://crates.io/crates/grpc-web-client)
[![Documentation](https://docs.rs/grpc-web-client/badge.svg)](https://docs.rs/grpc-web-client)
[![License](https://img.shields.io/crates/l/grpc-web-client)](LICENSE)

A Rust implementation of the [gRPC-Web protocol](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md) that allows using [tonic](https://github.com/hyperium/tonic) in browsers via wasm.

## Testing

Running the tests requires [`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/).

To run the tests, first start the server:

```bash
RUST_LOG=info cargo run -p test-server
```

Then, after the server is built and running, the tests can be run.

```bash
wasm-pack test --firefox --chrome --safari --headless test/test-client
```

## Acknowledgments

This package is heavily based on [webtonic](https://github.com/Sawchord/webtonic).
