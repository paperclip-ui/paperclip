import { parse_pc, serialize_pc } from "../../pkg/paperclip_parser_web";

describe(__dirname + "#", () => {
  it(`Can parse a simple file`, () => {
    const output = parse_pc(`text "Hello"`, `something`);
    const str = serialize_pc(output).trim();
    expect(str).toBe(`text "Hello"`);
  });
});
