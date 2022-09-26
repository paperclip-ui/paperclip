import fetch from "node-fetch";
const pkg = require("../../package.json");

export const downloadRelease = async () => {
  const releases = await fetch(
    `https://api.github.com/repos/paperclip-ui/paperclip/releases`
  ).then((response) => response.json());

  console.log(releases);
};

downloadRelease();
