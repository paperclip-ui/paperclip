fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_client(true)
        .build_server(cfg!(feature = "transport"))
        .compile(
            &[
                "src/service/designer.proto",
                "src/ast/css.proto",
                "src/ast/base.proto",
                "src/ast/pc.proto",
                "src/ast/docco.proto",
                "src/ast_mutate/mod.proto",
                "src/virt/css.proto",
                "src/virt/html.proto",
                "src/virt/core.proto",
                "src/virt/module.proto",
                "src/language_service/pc.proto",
            ],
            &["src/"],
        )?;
    Ok(())
}
