use anyhow::Result;

#[derive(Default)]
pub struct Observable<T: Clone> {
    pub value: T,
    txs: Vec<flume::Sender<T>>,
}

impl<T: Clone> Observable<T> {
    pub fn new(value: T) -> Self {
        Self { value, txs: vec![] }
    }
    pub fn update<TUpdater>(&mut self, update: TUpdater)
    where
        TUpdater: Fn(&T) -> T,
    {
        let new_value = (update)(&self.value);
        self.value = new_value.clone();
        for tx in &self.txs {
            tx.send(new_value.clone());
        }
    }
    pub fn watch<V, TSelector>(&mut self, selector: TSelector) -> Observer<T, V, TSelector>
    where
        TSelector: Fn(T) -> V,
    {
        let (tx, rx) = flume::unbounded();
        tx.send(self.value.clone());
        self.txs.push(tx);
        Observer { rx, selector }
    }
}

pub struct Observer<T, V, TSelector: Fn(T) -> V> {
    rx: flume::Receiver<T>,
    selector: TSelector,
}

impl<T, V, TSelector: Fn(T) -> V> Observer<T, V, TSelector> {
    pub async fn value(&self) -> Result<V> {
        let state = self.rx.recv_async().await?;
        Ok((self.selector)(state))
    }
}
