import {
  parseCSSBackroundValue,
  CSSBackgroundType,
  CSSSolidBackground,
  CSSLinearGradientBackground,
  CSSImageBackground
} from "./state";
import { expect } from "chai";

describe(__filename + "#", () => {
  it("can parse a simple linear-gradient as a red solid color", () => {
    const images = parseCSSBackroundValue(
      "linear-gradient(red, red)"
    ) as CSSSolidBackground[];
    expect(images.length).to.eql(1);
    expect(images[0].type).to.eql(CSSBackgroundType.SOLID);
    expect(images[0].color).to.eql("red");
  });

  it("can parse a simple linear-gradient as a rgba solid color", () => {
    const images = parseCSSBackroundValue(
      "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))"
    ) as CSSSolidBackground[];
    expect(images.length).to.eql(1);
    expect(images[0].type).to.eql(CSSBackgroundType.SOLID);
    expect(images[0].color).to.eql("rgba(0, 0, 0, 1)");
  });

  it("can parse a simple linear-gradient as rgba", () => {
    const images = parseCSSBackroundValue(
      "linear-gradient(0deg, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0.5) 11%)"
    ) as CSSLinearGradientBackground[];
    const gradient = images[0];
    expect(images.length).to.eql(1);
    expect(gradient.type).to.eql(CSSBackgroundType.LINEAR_GRADIENT);
    expect(gradient.stops.length).to.eql(2);
    expect(gradient.stops[0].color).to.eql("rgba(0, 0, 0, 1)");
    expect(gradient.stops[0].stop).to.eql(10);
    expect(gradient.stops[1].color).to.eql("rgba(0, 0, 0, 0.5)");
    expect(gradient.stops[1].stop).to.eql(11);
  });

  it("can parse a simple background image", () => {
    const images = parseCSSBackroundValue(
      "url(abcd.png)"
    ) as CSSImageBackground[];
    expect(images.length).to.eql(1);
    const image = images[0];
    expect(image.type).to.eql(CSSBackgroundType.IMAGE);
    expect(image.uri).to.eql("abcd.png");
  });

  it("can parse a simple background image with spaces", () => {
    const images = parseCSSBackroundValue(
      "url('a b c d.png')"
    ) as CSSImageBackground[];
    expect(images.length).to.eql(1);
    const image = images[0];
    expect(image.type).to.eql(CSSBackgroundType.IMAGE);
    expect(image.uri).to.eql("a b c d.png");
  });

  it("can parse multiple background images", () => {
    const images = parseCSSBackroundValue(
      "linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 1)), linear-gradient(0deg, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0.5) 11%)"
    ) as CSSSolidBackground[];
    expect(images.length).to.eql(2);
    const image = images[0];
    expect(image.type).to.eql(CSSBackgroundType.SOLID);
    expect(image.color).to.eql("rgba(0, 0, 0, 1)");
  });
});
