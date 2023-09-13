use super::load::LoadableGraph;
use super::test_utils::MockFS;

use futures::executor::block_on;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::graph_ext::Graph;
use std::collections::HashMap;

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
    if let Err(_err) =
        block_on(graph.load(&"/entry.pc".to_string(), &mock_fs, Options::new(vec![])))
    {
        panic!("unable to load");
    }
    // assert_eq!(block_on(graph.dependencies.lock()).len(), 2);
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

    if let Err(_err) =
        block_on(graph.load(&"/entry.pc".to_string(), &mock_fs, Options::new(vec![])))
    {
        panic!("unable to load");
    }

    // assert_eq!(block_on(graph.dependencies.lock()).len(), 2);
}
