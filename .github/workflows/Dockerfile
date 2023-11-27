FROM ubuntu:22.04

# Update default packages
RUN apt-get update

# Get Ubuntu packages
RUN apt-get install -y build-essential curl wget musl-tools unzip clang

# Update new packages
RUN apt-get update

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"



RUN mkdir -p /tmp/protoc && cd /tmp/protoc
RUN wget -qO- https://github.com/protocolbuffers/protobuf/releases/download/v25.1/protoc-25.1-linux-x86_64.zip -O temp.zip
RUN unzip temp.zip
RUN unzip -o temp.zip -d "/usr"
RUN chmod 755 /usr/bin/protoc


COPY . /app
WORKDIR /app

ENV TARGET=x86_64-unknown-linux-musl
ENV RUSTFLAGS='-C linker=clang -C link-arg=-fuse-ld=lld -C link-arg=-lpthread -C link-arg=-lm'
# ENV TARGET_CC=x86_64-linux-musl-gcc


RUN rustup target add ${TARGET}
RUN cargo build --release --locked --target ${TARGET} 

CMD echo "hello"