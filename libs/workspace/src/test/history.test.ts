import { startWorkspace, Workspace } from "../test_utils";
import { snakeCase } from "lodash";

const addCase = (
  name,
  files: Record<string, string>,
  test: (workspace: Workspace) => Promise<void>
) => {
  it(name, async () => {
    const workspace = await startWorkspace({
      files,
      namespace: snakeCase(name),
    });

    await test(workspace);
  });
};

// describe(__filename +s "#", () => {
//   addCase(`Can undo a change`, {
//     "entry.pc": `
//       text "Hello world"
//     `
//   }, async (workspace) => {

//     await workspace.client.OpenFile({ path: workspace.localFilesPaths["entry.pc"] }).subscribe({
//       next(result) {
//         console.log("NEXT", result.paperclip.html);
//       }
//     });

//   })
// });
