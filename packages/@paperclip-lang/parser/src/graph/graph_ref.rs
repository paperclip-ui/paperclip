use super::graph::Graph;
use crate::pc::ast;


enum Ref<'expr> {
  Style(&'expr ast::Style)
}

impl Graph {
  pub fn get_ref(&self, ref_path: &Vec<&str>, dep_path: &str) -> Option<String> {

    let curr_path = dep_path;

    for i in [0..ref_path.len()] {
      let part = ref_path.get(i).unwrap();

        let dep = if let Some(dep) = self.dependencies.get(curr_path) {
            dep
        } else {
            return None;
        };

        
    }
    None
  }
}