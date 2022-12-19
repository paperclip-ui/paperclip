/**
 * @jest-environment jsdom
 */

import {
  startDesigner,
  stringifyDesignerFrames,
  waitUntilDesignerReady,
} from "../controls";

describe(__filename + "#", () => {
  xit(`Can open a file with a parse error`, async () => {
    const designer = await startDesigner({
      "entry.pc": `
        /**
         * @bounds(x:25px)
         */

        div
      `,
    });

    const client = designer.getClient();

    await waitUntilDesignerReady(designer);

    const frames = stringifyDesignerFrames(designer);

    expect(frames).toEqual('<span id="_4f0e8e93-1">hello</span>');
    designer.dispose();
  });
});
