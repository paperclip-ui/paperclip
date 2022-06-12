import { deserializeModule } from "../deserialize";
import { serializeModule } from "../../serialize";
import { expect } from "chai";
import { DependencyGraph } from "../../graph";

describe(__filename + "#", () => {
  [
    {
      "entry.pc": `component Test {}`,
    },
  ].forEach((graph) => {
    it(`${graph} can be deserialized`, () => {
      const dslGraph: DependencyGraph = {};
      for (const uri in graph) {
        dslGraph[uri] = { uri, content: deserializeModule(graph[uri], uri) };
      }

      console.log(JSON.stringify(dslGraph, null, 2));

      expect(
        serializeModule(dslGraph["entry.pc"].content, "entry.pc", dslGraph)
      ).to.eql(graph["entry.pc"]);
    });
  });
});
