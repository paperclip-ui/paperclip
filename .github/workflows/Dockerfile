FROM messense/rust-musl-cross:x86_64-musl

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

RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

ENV NODE_VERSION=16.13.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version
RUN npm install --global yarn

# # need latest version of protoc
RUN mkdir -p /tmp/protoc && cd /tmp/protoc
RUN wget -qO- https://github.com/protocolbuffers/protobuf/releases/download/v25.1/protoc-25.1-linux-x86_64.zip -O temp.zip
RUN unzip temp.zip
RUN unzip -o temp.zip -d "/usr"
RUN chmod 755 /usr/bin/protoc

RUN ls

COPY build.sh /build.sh
RUN chmod 555 /build.sh



# RUN rustup target add ${TARGET}
ENTRYPOINT ["/build.sh"]
