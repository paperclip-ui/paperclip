#!/bin/sh -l

yarn install
yarn build
cargo build --release --locked --target x86_64-unknown-linux-musl
find target -maxdepth 3

echo "BIN_FILE=target/x86_64-unknown-linux-musl/release/paperclip_cli" >> "$GITHUB_OUTPUT"
