pub struct Attribute {
  pub name: String;
  pub value: String;  
}

pub struct Element {
  pub namespace: Option<String>,
  pub tag_name: String,
  pub attributes: Vec<Attribute>;
}

pub struct TextNode {
  pub name: String;
  pub value: String;
}

pub struct Component {
  pub name: Stirng;
  pub body: Node;
}

pub enum Node {
  Element(Element),
  Text(TextNode)
}


pub struct Module {
  pub path: String;
}


