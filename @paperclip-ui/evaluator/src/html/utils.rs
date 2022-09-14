pub fn is_void_tag(tag_name: &str) -> bool {
    match tag_name {
        "area" | "base" | "basefont" | "bgsound" | "br" | "col" | "command" | "embed" | "frame"
        | "hr" | "image" | "img" | "input" | "isindex" | "keygen" | "link" | "menuitem"
        | "meta" | "nextid" | "param" | "source" | "track" | "wbr" => true,
        _ => false,
    }
}
