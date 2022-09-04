// based on https://github.com/paperclip-ui/paperclip/blob/master/packages/paperclip-interim/src/state/html.ts

pub struct Attribute {
  pub source_id: Option<String>,
  pub name: String,
  pub value: String
}

pub struct Element {
  pub source_id: String,
  pub name: Option<String>,
  pub namespace: Option<String>,
  pub tag_name: String,
  pub attributes: Vec<Attribute>,
  pub scope_class_names: Vec<String>,
  pub child_nodes: Vec<Node>
}

pub struct TextNode {
  pub source_id: String,
  pub name: String,
  pub value: String
}

pub struct Component {
  pub source_id: String,
  pub name: String,
  pub public: bool,
  pub body: Node
}

pub enum Node {
  Element(Element),
  Text(TextNode)
}

pub struct Module {
  pub source_id: String,
  pub body: Vec<ModuleBodyItem>
}

pub enum Metadata {
  
}

pub enum ModuleBodyItem {
  Component(Component),
  Node(Node)
}

