import { startWorkspace } from "./utils";

describe(__filename + "#", () => {
  it(`Can evaluate a simple document`, async () => {
    const { designer } = await startWorkspace({
      "entry.pc": `
        div {
          text "Hello world"
        }
      `,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
