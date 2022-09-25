fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure().compile(
        &[
            "src/service/designer.proto",
            "src/ast/css.proto",
            "src/ast/base.proto",
            "src/ast/pc.proto",
            "src/ast/docco.proto",
            "src/virt/css.proto",
            "src/virt/html.proto",
            "src/virt/core.proto",
        ],
        &["src/"],
    )?;
    Ok(())
}
