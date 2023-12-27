use paperclip_proto::ast::graph_ext as graph;
use paperclip_proto::notice::base as notice;
use paperclip_proto::notice::base::NoticeResult;

struct Context {
    // graph: &'expr graph::Graph,
    notices: Vec<notice::Notice>,
}

/*
TODO:

- Check to make sure that instance exists
  - Follow instances and look for component. Should throw NotFound error
- lint styles
    - lint url() imports
    - lint vars
    - lint style refs
    - lint variant refs
    - lint variant refs
*/
pub fn lint_document<'expr>(_path: &str, _graph: &'expr graph::Graph) -> NoticeResult {
    // let dep = graph.dependencies.get(path).expect("Dependency must exist");

    let context = Context {
        notices: vec![],
        // graph,
    };

    // lint_document_body_items(
    //     dep.document.as_ref().expect("Document must exist"),
    //     &mut context,
    // );

    return notice::NoticeResult {
        notices: context.notices,
    };
}

// fn lint_document_body_items(document: &pc::Document, context: &mut Context) {
//     for item in &document.body {
//         match item.get_inner() {
//             pc::document_body_item::Inner::Component(_) => {}
//             pc::document_body_item::Inner::Atom(_) => {}
//             pc::document_body_item::Inner::DocComment(_) => {
//                 // TODO
//             }
//             pc::document_body_item::Inner::Element(_) => {
//                 // TODO
//             }
//             pc::document_body_item::Inner::Text(_) => {
//                 // TODO
//             }
//             pc::document_body_item::Inner::Trigger(_) => {
//                 // TODO
//             }
//             pc::document_body_item::Inner::Style(_) => {
//                 // TODO
//             }
//             pc::document_body_item::Inner::Import(_) => {
//                 // TODO
//             }
//         }
//     }
// }

// fn lint_component(component: &pc::Component, context: &mut Context) {
//     for item in &component.body {
//         match item.get_inner() {
//             pc::component_body_item::Inner::Script(expr) => {
//                 // TODO
//             }
//             pc::component_body_item::Inner::Render(expr) => {}
//             pc::component_body_item::Inner::Variant(expr) => {
//                 // TODO
//             }
//         }
//     }
// }

// fn lint_render(expr: &pc::Render, context: &mut Context) {}

// fn lint_node(expr: &pc::Node, context: &mut Context) {
//     match expr.get_inner() {
//         pc::node::Inner::Condition(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Element(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Text(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Insert(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Override(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Repeat(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Script(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Style(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Slot(expr) => {
//             // TODO
//         }
//         pc::node::Inner::Switch(expr) => {
//             // TODO
//         }
//     }
// }
