pub struct Element {
  source_id: String,
  attributes: Vec<Attribute>,
  // metadata: 
}

pub struct Attribute {
  source_id: String,
  name: String,
  value: String
}

pub struct TextNode {
  source_id: String,
  value: String,
  // metadata
}

pub struct Document {
  children: Vec<DocumentChild>
}

pub enum DocumentChild {
  Element(Element),
  TextNode(TextNode)
}