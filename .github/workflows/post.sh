#!/bin/bash

# https://localazy.com/blog/how-to-automatically-sign-macos-apps-using-github-actions
echo $MACOS_CERTIFICATE | base64 --decode > certificate.p12
security create-keychain -p $MACOS_CERTIFICATE_PWD build.keychain
security default-keychain -s build.keychain
security unlock-keychain -p $MACOS_CERTIFICATE_PWD build.keychain
security import certificate.p12 -k build.keychain -P $MACOS_CERTIFICATE_PWD -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k $MACOS_CERTIFICATE_PWD build.keychain
ID=$(security find-identity -v)
/usr/bin/codesign --force -s $ID ./target/release/paperclip-cli -v