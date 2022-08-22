use super::graph::{Graph, IO};
use super::test_utils::MockFS;
use crate::pc::serializer::serialize;
use futures::executor::block_on;
use futures::future::{BoxFuture, Future, FutureExt};
use std::collections::HashMap;
use std::sync::Arc;

#[test]
fn can_load_a_simple_graph() {
    let mock_fs = MockFS::new(HashMap::from([
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
    ]));
    let mut graph = Graph::new();
    block_on(graph.load(&"/entry.pc".to_string(), &mock_fs));
    assert_eq!(block_on(graph.dependencies.lock()).len(), 2);
}

#[test]
fn recursive_graphs_work() {
    let mock_fs = MockFS::new(HashMap::from([
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
    ]));

    let mut graph = Graph::new();
    block_on(graph.load(&"/entry.pc".to_string(), &mock_fs));

    assert_eq!(block_on(graph.dependencies.lock()).len(), 2);
}
