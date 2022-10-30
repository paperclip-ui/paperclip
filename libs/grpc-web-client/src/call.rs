// This file is based on https://github.com/alce/tonic/blob/86bbb1d5a4844882dec81bef7c1a554bd9464adf/tonic-web/tonic-web/src/call.rs

use gloo::console::console;
use std::mem;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::{convert::TryInto, error::Error};

use byteorder::{BigEndian, ByteOrder};
use bytes::{Buf, BufMut, Bytes, BytesMut};
use futures::{ready, Stream};
use http::{
    header::{self, HeaderName},
    HeaderMap, HeaderValue,
};
use http_body::{Body, SizeHint};
use tonic::Status;

use self::content_types::*;

pub(crate) mod content_types {
    use http::{header::CONTENT_TYPE, HeaderMap};

    pub(crate) const GRPC_WEB: &str = "application/grpc-web";
    pub(crate) const GRPC_WEB_PROTO: &str = "application/grpc-web+proto";
    pub(crate) const GRPC_WEB_TEXT: &str = "application/grpc-web-text";
    pub(crate) const GRPC_WEB_TEXT_PROTO: &str = "application/grpc-web-text+proto";

    pub(crate) fn is_grpc_web(headers: &HeaderMap) -> bool {
        matches!(
            content_type(headers),
            Some(GRPC_WEB) | Some(GRPC_WEB_PROTO) | Some(GRPC_WEB_TEXT) | Some(GRPC_WEB_TEXT_PROTO)
        )
    }

    fn content_type(headers: &HeaderMap) -> Option<&str> {
        headers.get(CONTENT_TYPE).and_then(|val| val.to_str().ok())
    }
}

const BUFFER_SIZE: usize = 2 * 1024;

// 8th (MSB) bit of the 1st gRPC frame byte
// denotes an uncompressed trailer (as part of the body)
const GRPC_WEB_TRAILERS_BIT: u8 = 0b10000000;

const HEADER_SIZE: usize = 5;

#[derive(Copy, Clone, PartialEq, Debug)]
enum Mode {
    Decode,
    Encode,
}

#[derive(Copy, Clone, PartialEq, Debug)]
pub enum Encoding {
    None,
    Base64,
}

#[derive(Copy, Clone, PartialEq, Debug)]
enum State {
    ReadHeader(usize),
    ReadData(usize),
    ReadTrailers(usize),
    Done,
}

pub(crate) struct GrpcWebCall<B> {
    inner: B,
    buf: BytesMut,
    header_buf: BytesMut,
    mode: Mode,
    encoding: Encoding,
    decode_trailers: bool,
    poll_trailers: bool,
    state: State,
    trailers: HeaderMap<HeaderValue>,
}

impl<B> GrpcWebCall<B>
where
    B: Body<Data = Bytes> + Unpin,
    B::Error: Error,
{
    pub(crate) fn server_request(inner: B, encoding: Encoding) -> Self {
        Self::new(inner, Mode::Decode, encoding, true, false)
    }

    pub(crate) fn server_response(inner: B, encoding: Encoding) -> Self {
        Self::new(inner, Mode::Encode, encoding, true, false)
    }

    pub(crate) fn client_request(inner: B, encoding: Encoding) -> Self {
        Self::new(inner, Mode::Encode, encoding, false, false)
    }

    pub(crate) fn client_response(inner: B, encoding: Encoding) -> Self {
        Self::new(inner, Mode::Decode, encoding, true, true)
    }

    fn new(
        inner: B,
        mode: Mode,
        encoding: Encoding,
        poll_trailers: bool,
        decode_trailers: bool,
    ) -> Self {
        console!("GrpcWebCall::new()".to_string());

        GrpcWebCall {
            inner,
            buf: BytesMut::with_capacity(match (mode, encoding) {
                (Mode::Encode, Encoding::Base64) => BUFFER_SIZE,
                _ => 0,
            }),
            header_buf: BytesMut::with_capacity(if decode_trailers { HEADER_SIZE } else { 0 }),
            mode,
            encoding,
            poll_trailers,
            decode_trailers,
            state: State::ReadHeader(5),
            trailers: HeaderMap::new(),
        }
    }

    #[inline]
    fn max_decodable(&self) -> usize {
        (self.buf.len() / 4) * 4
    }

    fn decode_chunk(&mut self) -> Result<Option<Bytes>, Status> {
        console!("GrpcWebCall::decode_chunk()".to_string());
        // not enough bytes to decode
        if self.buf.is_empty() || self.buf.len() < 4 {
            return Ok(None);
        }

        // Split `buf` at the largest index that is multiple of 4. Decode the
        // returned `Bytes`, keeping the rest for the next attempt to decode.
        base64::decode(self.buf.split_to(self.max_decodable()).freeze())
            .map(|decoded| Some(Bytes::from(decoded)))
            .map_err(internal_error)
    }

    // Key-value pairs encoded as a HTTP/1 headers block (without the terminating newline)
    fn encode_trailers(&self, trailers: HeaderMap) -> Vec<u8> {
        console!("GrpcWebCall::encode_trailers()".to_string());
        trailers.iter().fold(Vec::new(), |mut acc, (key, value)| {
            acc.put_slice(key.as_ref());
            acc.push(b':');
            acc.put_slice(value.as_bytes());
            acc.put_slice(b"\r\n");
            acc
        })
    }

    fn make_trailers_frame(&self, trailers: HeaderMap) -> Vec<u8> {
        let trailers = self.encode_trailers(trailers);
        let len = trailers.len();
        assert!(len <= u32::MAX as usize);

        let mut frame = Vec::with_capacity(len + HEADER_SIZE);
        frame.push(GRPC_WEB_TRAILERS_BIT);
        frame.put_u32(len as u32);
        frame.extend(trailers);

        frame
    }

    fn handle_frames(&mut self, mut bytes: Bytes) -> Result<Bytes, <B as Body>::Error> {
        if !self.decode_trailers {
            return Ok(bytes);
        }

        let mut curr_idx: usize = 0;
        let mut return_len = bytes.len();

        loop {
            if self.state == State::Done || curr_idx == bytes.len() {
                bytes.truncate(return_len);
                return Ok(bytes);
            }

            match self.state {
                State::ReadHeader(mut remaining) => {
                    let copy_len = if bytes.len() - curr_idx < remaining {
                        bytes.len() - curr_idx
                    } else {
                        remaining
                    };

                    self.header_buf
                        .extend_from_slice(&bytes[curr_idx..curr_idx + copy_len]);
                    curr_idx += copy_len;
                    remaining -= copy_len;

                    let is_trailer = self.header_buf[0] & GRPC_WEB_TRAILERS_BIT != 0;

                    if remaining > 0 {
                        self.state = State::ReadHeader(remaining);
                        if is_trailer {
                            // don't return trailers frame
                            return_len = bytes.len() - copy_len;
                        }
                        continue;
                    }

                    let frame_len: usize = BigEndian::read_u32(&self.header_buf[1..])
                        .try_into()
                        .unwrap();
                    self.header_buf.clear();
                    if is_trailer {
                        self.header_buf.reserve(frame_len);
                        self.state = State::ReadTrailers(frame_len);
                        return_len = curr_idx - copy_len;
                    } else {
                        self.state = State::ReadData(frame_len);
                    }
                }
                State::ReadData(remaining) => {
                    let buf_remaining = bytes.len() - curr_idx;
                    if buf_remaining < remaining {
                        self.state = State::ReadData(remaining - buf_remaining);
                        return Ok(bytes);
                    } else {
                        self.state = State::ReadHeader(HEADER_SIZE);
                        curr_idx += remaining;
                    }
                }
                State::ReadTrailers(remaining) => {
                    if curr_idx == 0 {
                        // if we just read a header, then the return_len is already correct, otherwise zero it out.
                        return_len = 0;
                    }

                    let buf_remaining = bytes.len() - curr_idx;
                    if buf_remaining < remaining {
                        self.header_buf.extend_from_slice(&bytes[curr_idx..]);
                        self.state = State::ReadTrailers(remaining - buf_remaining);
                        curr_idx += buf_remaining;
                        continue;
                    }

                    self.header_buf
                        .extend_from_slice(&bytes[curr_idx..curr_idx + remaining]);
                    let mut header_bytes = mem::replace(&mut self.header_buf, BytesMut::new());

                    let mut trailers = [httparse::EMPTY_HEADER; 64];
                    header_bytes.extend_from_slice(b"\n"); // parse_headers returns Status::Partial without this
                    let (_, trailers) =
                        httparse::parse_headers(header_bytes.as_ref(), &mut trailers)
                            .unwrap()
                            .unwrap();

                    self.trailers.reserve(trailers.len());
                    for h in trailers {
                        self.trailers.append(
                            HeaderName::from_bytes(h.name.as_bytes()).unwrap(),
                            HeaderValue::from_bytes(h.value).unwrap(),
                        );
                    }

                    self.state = State::Done;
                }
                State::Done => {}
            }
        }
    }
}

impl<B> GrpcWebCall<B>
where
    B: Body<Data = Bytes> + Unpin,
    B::Error: Error,
{
    fn poll_decode(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<B::Data, Status>>> {
        console!("GrpcWebCall::poll_decode()".to_string());

        match self.encoding {
            Encoding::Base64 => loop {
                if let Some(bytes) = self.decode_chunk()? {
                    return Poll::Ready(Some(self.handle_frames(bytes).map_err(internal_error)));
                }

                match ready!(Pin::new(&mut self.inner).poll_data(cx)) {
                    Some(Ok(data)) => self.buf.put(data),
                    Some(Err(e)) => return Poll::Ready(Some(Err(internal_error(e)))),
                    None => {
                        return if self.buf.has_remaining() {
                            Poll::Ready(Some(Err(internal_error("malformed base64 request"))))
                        } else {
                            Poll::Ready(None)
                        }
                    }
                }
            },

            Encoding::None => match ready!(Pin::new(&mut self.inner).poll_data(cx)) {
                Some(res) => Poll::Ready(Some(
                    res.and_then(|b| self.handle_frames(b))
                        .map_err(internal_error),
                )),
                None => Poll::Ready(None),
            },
        }
    }

    fn poll_encode(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<B::Data, Status>>> {
        console!("GrpcWebCall::poll_encode()".to_string());
        if let Some(mut res) = ready!(Pin::new(&mut self.inner).poll_data(cx)) {
            if self.encoding == Encoding::Base64 {
                res = res.map(|b| base64::encode(b).into())
            }

            return Poll::Ready(Some(res.map_err(internal_error)));
        }

        // this flag is needed because the inner stream never
        // returns Poll::Ready(None) when polled for trailers
        if self.poll_trailers {
            return match ready!(Pin::new(&mut self.inner).poll_trailers(cx)) {
                Ok(Some(map)) => {
                    let mut frame = self.make_trailers_frame(map);

                    if self.encoding == Encoding::Base64 {
                        frame = base64::encode(frame).into_bytes();
                    }

                    self.poll_trailers = false;
                    Poll::Ready(Some(Ok(frame.into())))
                }
                Ok(None) => Poll::Ready(None),
                Err(e) => Poll::Ready(Some(Err(internal_error(e)))),
            };
        }

        Poll::Ready(None)
    }
}

impl<B> Body for GrpcWebCall<B>
where
    B: Body<Data = Bytes> + Unpin,
    B::Error: Error,
{
    type Data = Bytes;
    type Error = Status;

    fn poll_data(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<Self::Data, Self::Error>>> {
        console!("GrpcWebCall::poll_data()".to_string());
        match self.mode {
            Mode::Decode => self.poll_decode(cx),
            Mode::Encode => self.poll_encode(cx),
        }
    }

    fn poll_trailers(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Result<Option<HeaderMap<HeaderValue>>, Self::Error>> {
        console!("GrpcWebCall::poll_trailers()".to_string());
        if !self.decode_trailers {
            return Poll::Ready(Ok(None));
        }
        loop {
            if self.state == State::Done {
                return Poll::Ready(Ok(Some(mem::replace(&mut self.trailers, HeaderMap::new()))));
            }
            match ready!(self.as_mut().poll_decode(cx)) {
                Some(Err(e)) => return Poll::Ready(Err(e)),
                _ => {}
            };
        }
    }

    fn is_end_stream(&self) -> bool {
        self.inner.is_end_stream()
    }

    fn size_hint(&self) -> SizeHint {
        self.inner.size_hint()
    }
}

impl<B> Stream for GrpcWebCall<B>
where
    B: Body<Data = Bytes> + Unpin,
    B::Error: Error,
{
    type Item = Result<Bytes, Status>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        console!("GrpcWebCall::poll_next()".to_string());
        Body::poll_data(self, cx)
    }
}

impl Encoding {
    pub(crate) fn from_content_type(headers: &HeaderMap) -> Encoding {
        Self::from_header(headers.get(header::CONTENT_TYPE))
    }

    pub(crate) fn from_accept(headers: &HeaderMap) -> Encoding {
        Self::from_header(headers.get(header::ACCEPT))
    }

    pub(crate) fn to_content_type(&self) -> &'static str {
        match self {
            Encoding::Base64 => GRPC_WEB_TEXT_PROTO,
            Encoding::None => GRPC_WEB_PROTO,
        }
    }

    fn from_header(value: Option<&HeaderValue>) -> Encoding {
        match value.and_then(|val| val.to_str().ok()) {
            Some(GRPC_WEB_TEXT_PROTO) | Some(GRPC_WEB_TEXT) => Encoding::Base64,
            _ => Encoding::None,
        }
    }
}

fn internal_error(e: impl std::fmt::Display) -> Status {
    Status::internal(e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encoding_constructors() {
        let cases = &[
            (GRPC_WEB, Encoding::None),
            (GRPC_WEB_PROTO, Encoding::None),
            (GRPC_WEB_TEXT, Encoding::Base64),
            (GRPC_WEB_TEXT_PROTO, Encoding::Base64),
            ("foo", Encoding::None),
        ];

        let mut headers = HeaderMap::new();

        for case in cases {
            headers.insert(header::CONTENT_TYPE, case.0.parse().unwrap());
            headers.insert(header::ACCEPT, case.0.parse().unwrap());

            assert_eq!(Encoding::from_content_type(&headers), case.1, "{}", case.0);
            assert_eq!(Encoding::from_accept(&headers), case.1, "{}", case.0);
        }
    }
}
