fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_client(true)
        .build_server(cfg!(feature = "transport"))
        .type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]")
        .type_attribute(".", "#[serde(rename_all = \"camelCase\")]")
        .compile(
            &[
                "src/service/designer.proto",
                "src/ast/css.proto",
                "src/ast/base.proto",
                "src/ast/shared.proto",
                "src/ast/graph.proto",
                "src/ast/pc.proto",
                "src/ast/docco.proto",
                "src/ast_mutate/mod.proto",
                "src/virt/css.proto",
                "src/virt/html.proto",
                "src/virt/module.proto",
                "src/language_service/pc.proto",
                "src/notice/base.proto",
            ],
            &["src/"],
        )?;
    Ok(())
}
