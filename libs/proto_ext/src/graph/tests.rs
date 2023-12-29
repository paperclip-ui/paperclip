use super::load::LoadableGraph;
use super::test_utils::MockFS;

use futures::executor::block_on;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::ast::base::{Range, U16Position};
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::notice;
use paperclip_proto::notice::base::{Notice, NoticeList};
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

#[test]
fn errors_if_import_doesnt_exist() {
    let mock_fs = MockFS::new(HashMap::from([(
        "/entry.pc",
        r#"
                  import "/test.pc" as test
                  component Test {
                    render div {
                      test.El
                    }
                  }
                "#,
    )]));

    let mut graph = Graph::new();

    let err = block_on(graph.load(&"/entry.pc".to_string(), &mock_fs, Options::new(vec![])));

    assert_eq!(
        err,
        Err(NoticeList {
            items: vec![Notice {
                level: notice::base::Level::Error.into(),
                code: notice::base::Code::FileNotFound.into(),
                message: "File not found".to_string(),
                path: Some("/entry.pc".to_string()),
                content_range: Some(Range::new(
                    U16Position::new(19, 2, 19),
                    U16Position::new(63, 3, 19)
                ))
            }]
        })
    )

    // assert_eq!(block_on(graph.dependencies.lock()).len(), 2);
}
