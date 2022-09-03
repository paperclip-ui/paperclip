// based on https://github.com/paperclip-ui/paperclip/blob/master/packages/paperclip-interim/src/state/html.ts

pub struct Attribute {
  pub name: String,
  pub value: String
}

pub struct Element {
  pub name: Option<String>,
  pub namespace: Option<String>,
  pub tag_name: String,
  pub attributes: Vec<Attribute>,
  pub scope_class_names: Vec<String>
}

pub struct TextNode {
  pub name: String,
  pub value: String
}

pub struct Component {
  pub name: String,
  pub public: bool,
  pub body: Node
}

pub enum Node {
  Element(Element),
  Text(TextNode)
}

pub struct Module {
  pub body: Vec<ModuleBodyItem>
}

pub enum ModuleBodyItem {
  Component(Component),
  Node(Node)
}

