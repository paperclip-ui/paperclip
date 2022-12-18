use anyhow::{Error, Result};
use paperclip_common::get_or_short;
use paperclip_config::ConfigContext;
use paperclip_evaluator::css;
use paperclip_evaluator::html;
use paperclip_proto::ast::graph_ext::Graph;
use paperclip_proto::ast_mutate::MutationResult;
use paperclip_proto::virt::module::pc_module_import;
use paperclip_proto::virt::module::{GlobalScript, PcModule, PcModuleImport, PccssImport};
use std::collections::HashMap;
use std::collections::HashSet;

pub struct History {
    pub changes: Vec<Graph>,
    pub position: usize,
}

pub struct StartOptions {
    pub config_context: ConfigContext,
    pub open: bool,
    pub port: Option<u16>,
    pub component_screenshots: bool,
}

pub struct ServerState {
    pub component_screenshots: bool,
    pub history: History,
    pub doc_checksums: HashMap<String, String>,
    pub file_cache: HashMap<String, Vec<u8>>,
    pub options: StartOptions,
    pub screenshot_queue: HashSet<String>,
    pub screenshots_running: bool,
    pub latest_ast_changes: Vec<MutationResult>,
    pub graph: Graph,
    pub evaluated_modules: HashMap<String, (css::virt::Document, html::virt::Document)>,
    pub updated_files: Vec<String>,
}

impl ServerState {
    pub fn new(options: StartOptions) -> Self {
        Self {
            component_screenshots: options.component_screenshots,
            screenshot_queue: HashSet::default(),
            history: History {
                changes: vec![],
                position: 0,
            },
            options,
            screenshots_running: false,
            doc_checksums: HashMap::new(),
            file_cache: HashMap::new(),
            graph: Graph::new(),
            evaluated_modules: HashMap::new(),
            latest_ast_changes: vec![],
            updated_files: vec![],
        }
    }

    // TODO - this needs to be moved to PC runtime instead
    pub fn bundle_evaluated_module(&self, path: &str) -> Result<PcModule> {
        let (css, html) = get_or_short!(
            self.evaluated_modules.get(path),
            Err(Error::msg(format!("File not evaluated yet {}", path)))
        );

        let mut imported: HashSet<String> = HashSet::new();
        let mut to_import: Vec<String> = vec![path.to_string()];
        let mut imports = vec![];

        while let Some(path) = to_import.pop() {
            let dep = self.graph.dependencies.get(&path).unwrap();

            for (_rel, path) in &dep.imports {
                if !imported.contains(path) {
                    imported.insert(path.to_string());
                    to_import.push(path.to_string());
                }

                if let Some((css, _)) = self.evaluated_modules.get(path) {
                    imports.push(PcModuleImport {
                        inner: Some(pc_module_import::Inner::Css(PccssImport {
                            path: path.to_string(),
                            css: Some(css.clone()),
                        })),
                    })
                }
            }
        }

        imports.extend(
            self.options
                .config_context
                .get_global_script_paths()
                .iter()
                .filter_map(|path| {
                    Some(PcModuleImport {
                        inner: Some(pc_module_import::Inner::GlobalScript(GlobalScript {
                            path: path.to_string(),
                            content: self.file_cache.get(path).and_then(|content| {
                                Some(std::str::from_utf8(content).unwrap().to_string())
                            }),
                        })),
                    })
                })
                .collect::<Vec<PcModuleImport>>(),
        );

        Ok(PcModule {
            html: Some(html.clone()),
            css: Some(css.clone()),
            imports,
        })
    }
}
