use super::{expr_map::ExprMap, graph::Graph};
use std::cell::OnceCell;
use std::rc::Rc;

pub struct GraphContainer<'graph> {
    pub graph: &'graph Graph,
    expr_map: Rc<OnceCell<ExprMap>>,
}

impl<'graph> GraphContainer<'graph> {
    pub fn new(graph: &'graph Graph) -> Self {
        Self {
            graph,
            expr_map: Rc::new(OnceCell::new()),
        }
    }
    pub fn get_expr_map(&self) -> &ExprMap {
        self.expr_map
            .get_or_init(|| ExprMap::from_graph(&self.graph))
    }
}
