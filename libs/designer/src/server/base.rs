#[macro_export]
macro_rules! handle_store_event {
    ($store: expr, $event: pat => $body: expr) => {
        let chan = $store.lock().await.events.subscribe();
        tokio::spawn(async move {
            while let Ok(event) = chan.recv() {
                match event {
                    $event => $body,
                    _ => {}
                }
            }
        })
    };
}
