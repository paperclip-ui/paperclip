import puppeteer from "puppeteer";

type Context = {
  migratedPages: Record<string, string>;
  browser: puppeteer.Browser;
};

export const migrate = async (resourceUrl: string) => {
  console.log(`Launching headless browser`);
  const browser = await puppeteer.launch();
  const migratedPages = {};

  const migratePage = async (url: string) => {
    if (migratedPages[url]) {
      return;
    }
    migratedPages[url] = true;

    console.log(`Migrating page: ${url}`);
    const page = await browser.newPage();
    await page.goto(url);

    const { links, assets, content } = await page.evaluate(scrapeData);

    console.log(content);

    await migrateLinks(links, url);
  };

  const migrateLinks = async (pathnames: string[], from: string) => {
    await Promise.all(
      pathnames.map((pathname) => {
        const url = new URL(from);
        return migratePage(url.protocol + "//" + url.hostname + pathname);
      })
    );
  };

  await migratePage(resourceUrl);

  browser.close();
};

type ConvertNodeContext = {
  content: string;
  depth: number;
  isNewLine: boolean;
  indent: string;
};

const scrapeData = () => {
  const links = Array.from(document.body.getElementsByTagName("a"))
    .map((anchor) => {
      return anchor.href && new URL(anchor.href);
    })
    .filter(
      (href) =>
        href?.hostname === location.hostname &&
        href.pathname !== location.pathname
    )
    .map((href) => {
      return href.pathname;
    });

  const assets = [];

  const addBuffer = (
    value: string,
    context: ConvertNodeContext
  ): ConvertNodeContext => ({
    ...context,
    isNewLine: value.charAt(value.length - 1) === "\n",
    content:
      context.content +
      (context.isNewLine ? context.indent.repeat(context.depth) : "") +
      value,
  });

  const startBlock = (context: ConvertNodeContext) => ({
    ...context,
    depth: context.depth + 1,
  });

  const endBlock = (context: ConvertNodeContext) => ({
    ...context,
    depth: context.depth - 1,
  });

  const convertNode = (node: Node, context: ConvertNodeContext) => {
    if (node.nodeType === 3) {
      context = addBuffer(node.textContent + "\n", context);
    } else if (node.nodeType === 1) {
      const element = node as HTMLElement;
      let tagName = node.nodeName.toLowerCase();

      if (/^(script|style|iframe|svg$)/.test(tagName)) {
        console.warn(`Skipping tag ${tagName}`);
        return context;
      }

      if (tagName === "body") {
        tagName = "div";
      }

      context = addBuffer(tagName, context);

      const attrs = Array.from(element.attributes)
        .map((attr) => {
          if (attr.name === "class") {
            return;
          }
          return `${attr.name}: "${attr.value}"`;
        })
        .filter(Boolean)
        .join(",");

      if (attrs.length) {
        context = addBuffer(`(${attrs})`, context);
      }

      context = addBuffer(" {\n", context);
      const style = window.getComputedStyle(element);
      context = addBuffer(`style {\n`, context);
      context = startBlock(context);
      for (const key in style) {
        context = addBuffer(`${key}: ${style[key]}\n`, context);
      }
      context = endBlock(context);
      context = addBuffer(`}`, context);

      context = startBlock(context);
      context = Array.from(element.childNodes).reduce((context, child) => {
        context = convertNode(child, context);
        // context = addBuffer("\n", context);
        return context;
      }, context);
      context = endBlock(context);
      context = addBuffer("}\n", context);
    }

    return context;
  };

  const context = convertNode(document.body, {
    content: "",
    isNewLine: false,
    indent: "  ",
    depth: 0,
  });

  return {
    links,
    assets,
    content: context.content,
  };
};
