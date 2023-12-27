use paperclip_evaluator::css::evaluator as css_evaluator;
use paperclip_evaluator::html::evaluator as html_evaluator;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::{ast::graph, notice::base::NoticeResult};
use paperclip_proto_ext::graph::{io::IO, LoadableGraph};

use crate::lint::lint_document;

pub async fn validate_document<TIO: IO>(path: &str, io: &TIO, options: &Options) -> NoticeResult {
    let mut graph = graph::Graph::new();

    if let Err(err) = graph.load(path, io, options.clone()).await {
        return err;
    }

    let mut notices: NoticeResult = NoticeResult::new();

    if let Err(err) = html_evaluator::evaluate(
        path,
        &graph,
        io,
        html_evaluator::Options {
            include_components: true,
        },
    )
    .await
    {
        notices.extend(&err);
    }
    if let Err(err) = css_evaluator::evaluate(path, &graph, io).await {
        notices.extend(&err);
    }

    notices.extend(&lint_document(path, &graph));

    notices
}

pub async fn validate_documents<TIO: IO>(
    paths: &Vec<String>,
    io: &TIO,
    options: &Options,
) -> NoticeResult {
    let mut notices = NoticeResult::new();
    for path in paths {
        notices.extend(&validate_document(path, io, options).await);
    }
    notices
}
