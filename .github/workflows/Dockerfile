FROM messense/rust-musl-cross:x86_64-musl

COPY . /app
WORKDIR /app
RUN rustup update beta && \
    rustup target add --toolchain beta x86_64-unknown-linux-musl

# FROM ubuntu:22.04

# # Update default packages
RUN apt-get update

# # Get Ubuntu packages
RUN apt-get install -y wget

# # Update new packages
# RUN apt-get update

# RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
# ENV PATH="/root/.cargo/bin:${PATH}"


# # need latest version of protoc
RUN mkdir -p /tmp/protoc && cd /tmp/protoc
RUN wget -qO- https://github.com/protocolbuffers/protobuf/releases/download/v25.1/protoc-25.1-linux-x86_64.zip -O temp.zip
RUN unzip temp.zip
RUN unzip -o temp.zip -d "/usr"
RUN chmod 755 /usr/bin/protoc




# RUN rustup target add ${TARGET}
RUN [".github/workflows/build.sh"]
