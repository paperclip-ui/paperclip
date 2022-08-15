use super::graph::{Graph, IO};
use crate::pc::serializer::serialize;
use futures::executor::block_on;
use futures::future::{BoxFuture, Future, FutureExt};
use std::collections::HashMap;
use std::sync::Arc;

struct MockFS<'kv> {
    files: Arc<HashMap<&'kv str, &'kv str>>,
}

impl<'kv> IO for MockFS<'kv> {
    fn resolve(&self, _from_path: &String, to_path: &String) -> BoxFuture<'static, Option<String>> {
        let content = Some(to_path.to_string());

        async { content }.boxed()
    }
    fn read(&self, path: &String) -> BoxFuture<'static, Option<String>> {
        let content = if let Some(content) = self.files.get(path.as_str()) {
            Some(content.to_string())
        } else {
            None
        };

        async { content }.boxed()
    }
}

#[test]
fn can_load_a_simple_graph() {
    let mock_fs = MockFS {
        files: Arc::new(HashMap::from([
            (
                "/entry.pc",
                r#"
                  import "/test.pc" as test
                  component Test {
                    render div {
                      test.El
                    }
                  }
                "#,
            ),
            (
                "/test.pc",
                r#"
                  public component El {
                    render span
                  }
                "#,
            ),
        ])),
    };

    let mut graph = Graph::new();
    block_on(graph.load(&"/entry.pc".to_string(), &mock_fs));

    let deps = block_on(graph.dependencies.lock());
    assert_eq!(deps.len(), 2);
}

#[test]
fn recursive_graphs_work() {
    let mock_fs = MockFS {
        files: Arc::new(HashMap::from([
            (
                "/entry.pc",
                r#"
                  import "/test.pc" as test
                  component Test {
                    render div {
                      test.El
                    }
                  }
                "#,
            ),
            (
                "/test.pc",
                r#"
                  import "/entry.pc" as entry
                  public component El {
                    render span
                  }
                "#,
            ),
        ])),
    };

    let mut graph = Graph::new();
    block_on(graph.load(&"/entry.pc".to_string(), &mock_fs));

    let deps = block_on(graph.dependencies.lock());
    assert_eq!(deps.len(), 2);
}
