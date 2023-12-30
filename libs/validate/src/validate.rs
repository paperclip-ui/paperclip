use paperclip_config::{Config, LintConfig};
use paperclip_evaluator::css::evaluator as css_evaluator;
use paperclip_evaluator::html::evaluator as html_evaluator;
use paperclip_parser::core::parser_context::Options;
use paperclip_proto::{ast::graph, notice::base::NoticeList};
use paperclip_proto_ext::graph::{io::IO, LoadableGraph};

use crate::lint::lint_document;

pub struct ValidateOptions {
    parse_options: Options,
    lint_config: LintConfig,
}

impl ValidateOptions {
    pub fn new(lint_config: LintConfig, parse_options: Options) -> Self {
        ValidateOptions {
            parse_options,
            lint_config,
        }
    }
    pub fn from_config(config: &Config) -> Self {
        Self::new(
            config.lint.clone().unwrap_or(LintConfig::default()),
            config.into_parser_options(),
        )
    }
    pub fn from_parse_options(parse_options: Options) -> Self {
        Self::new(LintConfig::default(), parse_options)
    }
}

pub async fn validate_document<TIO: IO>(
    path: &str,
    io: &TIO,
    options: &ValidateOptions,
) -> NoticeList {
    let mut graph = graph::Graph::new();

    if let Err(err) = graph.load(path, io, options.parse_options.clone()).await {
        return err;
    }

    let mut notices: NoticeList = NoticeList::new();

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

    notices.extend(&lint_document(path, &graph, &options.lint_config));

    notices
}

pub async fn validate_documents<TIO: IO>(
    paths: &Vec<String>,
    io: &TIO,
    options: &ValidateOptions,
) -> NoticeList {
    let mut notices = NoticeList::new();
    for path in paths {
        notices.extend(&validate_document(path, io, options).await);
    }
    notices
}
