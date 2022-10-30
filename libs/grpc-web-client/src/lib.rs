mod call;

use bytes::Bytes;
use call::{Encoding, GrpcWebCall};
use core::{
    fmt,
    task::{Context, Poll},
};
use futures::{Future, Stream, TryStreamExt};
use gloo::console::console;
use http::{header::HeaderName, request::Request, response::Response, HeaderMap, HeaderValue};
use http_body::Body;
use js_sys::{Array, Uint8Array};
use std::{error::Error, pin::Pin};
use tonic::{body::BoxBody, client::GrpcService, Status};
use wasm_bindgen::{JsCast, JsValue};
use wasm_bindgen_futures::JsFuture;
use wasm_streams::ReadableStream;
use web_sys::{console, Headers, RequestInit};

#[derive(Debug, Clone, PartialEq)]
pub enum ClientError {
    Err,
    FetchFailed(JsValue),
}

impl Error for ClientError {}
impl fmt::Display for ClientError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

pub type CredentialsMode = web_sys::RequestCredentials;

pub type RequestMode = web_sys::RequestMode;

#[derive(Clone)]
pub struct Client {
    base_uri: String,
    credentials: CredentialsMode,
    mode: RequestMode,
    encoding: Encoding,
}

impl Client {
    pub fn new(base_uri: String) -> Self {
        Client {
            base_uri,
            credentials: CredentialsMode::SameOrigin,
            mode: RequestMode::Cors,
            encoding: Encoding::None,
        }
    }

    async fn request(self, rpc: Request<BoxBody>) -> Result<Response<BoxBody>, ClientError> {
        console!("Client::request()".to_string());
        let mut uri = rpc.uri().to_string();
        uri.insert_str(0, &self.base_uri);

        let headers = Headers::new().unwrap();
        for (k, v) in rpc.headers().iter() {
            headers.set(k.as_str(), v.to_str().unwrap()).unwrap();
        }
        headers.set("x-user-agent", "grpc-web-rust/0.1").unwrap();
        headers.set("x-grpc-web", "1").unwrap();
        headers
            .set("content-type", self.encoding.to_content_type())
            .unwrap();

        let body_bytes = hyper::body::to_bytes(rpc.into_body()).await.unwrap();
        let body_array: Uint8Array = body_bytes.as_ref().into();
        let body_js: &JsValue = body_array.as_ref();

        let mut init = RequestInit::new();
        init.method("POST")
            .mode(self.mode)
            .credentials(self.credentials)
            .body(Some(body_js))
            .headers(headers.as_ref());

        let request = web_sys::Request::new_with_str_and_init(&uri, &init).unwrap();

        let window = web_sys::window().unwrap();
        let fetch = JsFuture::from(window.fetch_with_request(&request))
            .await
            .map_err(ClientError::FetchFailed)?;

        let fetch_res: web_sys::Response = fetch.dyn_into().unwrap();

        let mut res = Response::builder().status(fetch_res.status());
        let headers = res.headers_mut().unwrap();

        for kv in js_sys::try_iter(fetch_res.headers().as_ref())
            .unwrap()
            .unwrap()
        {
            let pair: Array = kv.unwrap().into();
            headers.append(
                HeaderName::from_bytes(pair.get(0).as_string().unwrap().as_bytes()).unwrap(),
                HeaderValue::from_str(&pair.get(1).as_string().unwrap()).unwrap(),
            );
        }

        let body_stream = ReadableStream::from_raw(fetch_res.body().unwrap().unchecked_into());
        let body = GrpcWebCall::client_response(
            ReadableStreamBody::new(body_stream),
            Encoding::from_content_type(headers),
        );

        Ok(res.body(BoxBody::new(body)).unwrap())
    }
}

impl GrpcService<BoxBody> for Client {
    type ResponseBody = BoxBody;
    type Error = ClientError;
    type Future = Pin<Box<dyn Future<Output = Result<Response<BoxBody>, ClientError>>>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        console!("impl GrpcService for Client::poll_ready()".to_string());
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, rpc: Request<BoxBody>) -> Self::Future {
        console!("impl GrpcService for Client::call()".to_string());
        Box::pin(self.clone().request(rpc))
    }
}

struct ReadableStreamBody {
    stream: Pin<Box<dyn Stream<Item = Result<Bytes, Status>>>>,
}

impl ReadableStreamBody {
    fn new(inner: ReadableStream) -> Self {
        console!("ReadableStreamBody::new()".to_string());
        ReadableStreamBody {
            stream: Box::pin(
                inner
                    .into_stream()
                    .map_ok(|buf_js| {
                        console!("[ReadableStreamBody] inner.into_stream().map_ok()".to_string());
                        let buffer = Uint8Array::new(&buf_js);
                        let mut bytes_vec = vec![0; buffer.length() as usize];
                        buffer.copy_to(&mut bytes_vec);
                        let bytes: Bytes = bytes_vec.into();
                        bytes
                    })
                    .map_err(|_| Status::unknown("readablestream error")),
            ),
        }
    }
}

impl Body for ReadableStreamBody {
    type Data = Bytes;
    type Error = Status;

    fn poll_data(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<Self::Data, Self::Error>>> {
        console!("impl Body for eadableStreamBody::poll_data()".to_string());
        self.stream.as_mut().poll_next(cx)
    }

    fn poll_trailers(
        self: Pin<&mut Self>,
        _: &mut Context<'_>,
    ) -> Poll<Result<Option<HeaderMap>, Self::Error>> {
        Poll::Ready(Ok(None))
    }

    fn is_end_stream(&self) -> bool {
        console!("ReadableStreamBody::is_end_stream()".to_string());
        false
    }
}

// WARNING: these are required to satisfy the Body and Error traits, but JsValue is not thread-safe.
// This shouldn't be an issue because wasm doesn't have threads currently.

unsafe impl Sync for ReadableStreamBody {}
unsafe impl Send for ReadableStreamBody {}

unsafe impl Sync for ClientError {}
unsafe impl Send for ClientError {}
