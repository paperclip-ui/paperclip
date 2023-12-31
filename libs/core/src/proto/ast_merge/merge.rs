use super::base::*;
use crate::mergeable;
use paperclip_proto::ast::pc;

mergeable! {
  (pc::Document, (self, _other) {

  })
}
