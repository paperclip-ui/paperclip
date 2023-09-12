#!/bin/sh
# cd ..;
# echo $(pwd);
# mkdir -p lib && protoc --proto_path=src --plugin=\"protoc-gen-grpc-web=../../node_modules/.bin/protoc-gen-grpc-web\" --grpc-web_out=\"import_style=commonjs+dts,mode=grpcwebtext:./lib\" --js_out=\"import_style=commonjs:./lib\" src/service/designer.proto src/ast/pc.proto src/ast/css.proto  src/virt/core.proto   src/virt/html.proto  src/ast/base.proto src/ast/shared.proto  src/virt/css.proto src/ast/docco.proto
