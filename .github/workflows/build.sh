#!/bin/sh -l

yarn install
echo $1
cd $1
cargo build --release --locked --target x86_64-unknown-linux-musl

echo "BIN_FILE=target/release/paperclip_cli" >> "$GITHUB_OUTPUT"
