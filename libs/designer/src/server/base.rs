

#[macro_export]
macro_rules! handle_store_events {
    ($store: expr, $($event: pat => $body: expr),*) => {
        let store2 = $store.clone();
        let chan = store2.lock().unwrap().subscribe();

        tokio::spawn(async move {
            while let Ok(event) = chan.recv().await {
                match &*event {
                    $(
                        $event => $body
                    ),*
                    _ => {}
                }
            }
        });
        
    };
}
