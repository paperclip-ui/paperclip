#!/bin/sh -l

yarn install
yarn build
cargo build --release --locked --target x86_64-unknown-linux-musl
find target -maxdepth 2

echo "BIN_FILE=target/release/paperclip_cli" >> "$GITHUB_OUTPUT"
