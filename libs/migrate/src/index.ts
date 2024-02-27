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

    const { links, assets } = await page.evaluate(scrapeData);

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

  const assets = {};

  return {
    links,
    assets,
  };
};
