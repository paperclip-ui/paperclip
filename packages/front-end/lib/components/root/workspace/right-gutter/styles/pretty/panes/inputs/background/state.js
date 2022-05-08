import { EMPTY_ARRAY } from "tandem-common";
// TODO - compute this information based on CSS properties
export var CSSBackgroundType;
(function (CSSBackgroundType) {
    CSSBackgroundType[CSSBackgroundType["SOLID"] = 0] = "SOLID";
    CSSBackgroundType[CSSBackgroundType["LINEAR_GRADIENT"] = 1] = "LINEAR_GRADIENT";
    CSSBackgroundType[CSSBackgroundType["IMAGE"] = 2] = "IMAGE";
})(CSSBackgroundType || (CSSBackgroundType = {}));
export var BackgroundBlendMode;
(function (BackgroundBlendMode) {
    BackgroundBlendMode["SATURATION"] = "saturation";
})(BackgroundBlendMode || (BackgroundBlendMode = {}));
export const computeCSSBackgrounds = ({ style }) => {
    const source = style["background-image"];
    if (!source) {
        return EMPTY_ARRAY;
    }
    const backgrounds = parseCSSBackroundValue(source);
    let newBackgrounds = [];
    for (let i = 0, n = backgrounds.length; i < n; i++) {
        let newBackground = backgrounds[i];
        switch (newBackground.type) {
            case CSSBackgroundType.IMAGE: {
                newBackground = Object.assign(Object.assign({}, newBackground), { repeat: getCSSParamValue(style["background-repeat"], i) || "repeat", size: getCSSParamValue(style["background-size"], i) || "auto", position: getCSSParamValue(style["background-position"], i) || "0px" });
                break;
            }
        }
        newBackgrounds.push(newBackground);
    }
    return newBackgrounds;
};
const getCSSParamValue = (value, index) => {
    return value && value.split(/\s*,\s*/)[index];
};
export const parseCSSBackroundValue = (value) => {
    const scanner = new Scanner(value);
    const tokenizer = new Tokenizer(scanner);
    return getBackgroundExpressions(tokenizer);
};
const getBackgroundExpressions = (tokenizer) => {
    const backgrounds = [];
    while (!tokenizer.ended()) {
        tokenizer.eatWhitespace();
        backgrounds.push(getBackgroundExpression(tokenizer));
        tokenizer.next();
    }
    return backgrounds;
};
const getBackgroundExpression = (tokenizer) => {
    const keyword = tokenizer.next();
    const t = tokenizer.next();
    if (t.type === TokenType.L_PAREN) {
        const params = getParams(tokenizer);
        if (keyword.value === "linear-gradient") {
            if (params.length === 2 && params[0] === params[1]) {
                const solid = {
                    color: params[0],
                    type: CSSBackgroundType.SOLID
                };
                return solid;
            }
            else {
                let degree;
                if (/deg$/.test(params[0])) {
                    degree = params.shift();
                }
                const stops = [];
                for (const param of params) {
                    const [, color, stop] = param.match(/(.*?)([\d\.]+%)$/);
                    stops.push({
                        color: color.trim(),
                        stop: Number(stop.trim().replace("%", ""))
                    });
                }
                const linearGradient = {
                    stops,
                    type: CSSBackgroundType.LINEAR_GRADIENT,
                    degree
                };
                return linearGradient;
            }
        }
        else if (keyword.value === "url") {
            const image = {
                uri: params.join(","),
                type: CSSBackgroundType.IMAGE
            };
            return image;
        }
        else {
            throw new Error(`unexpected keyword ${keyword.value}`);
        }
    }
    return null;
};
const getParams = (tokenizer) => {
    const params = [];
    let buffer = "";
    while (!tokenizer.ended()) {
        const curr = tokenizer.next();
        if (curr.type === TokenType.R_PAREN) {
            params.push(buffer.trim());
            break;
        }
        if (curr.type === TokenType.COMMA) {
            params.push(buffer.trim());
            buffer = "";
            continue;
        }
        let value = curr.value;
        if (!tokenizer.ended()) {
            if (curr.type === TokenType.APOS || curr.type === TokenType.QUOTE) {
                value = getString(tokenizer);
            }
            else if (tokenizer.peek().type === TokenType.L_PAREN) {
                tokenizer.next(); // eat (
                value = `${value}(${getParams(tokenizer).join(", ")})`;
            }
        }
        buffer += value;
    }
    return params;
};
const getString = (tokenizer) => {
    let buffer = "";
    while (!tokenizer.ended()) {
        const curr = tokenizer.next();
        if (curr.type === TokenType.QUOTE || curr.type === TokenType.APOS) {
            break;
        }
        buffer += curr.value;
    }
    return buffer;
};
export const stringifyCSSBackground = (background) => {
    switch (background.type) {
        case CSSBackgroundType.IMAGE: {
            return `url("${background.uri}")`;
        }
        case CSSBackgroundType.LINEAR_GRADIENT: {
            return `linear-gradient()`;
        }
        case CSSBackgroundType.SOLID: {
            return `linear-gradient(${background.color}, ${background.color})`;
        }
    }
};
export const getCSSBackgroundsStyle = (backgrounds) => {
    let style = {};
    for (const background of backgrounds) {
        switch (background.type) {
            case CSSBackgroundType.IMAGE: {
                style = addStyle(style, "background-image", stringifyCSSBackground(background));
                style = addStyle(style, "background-repeat", background.repeat || "repeat");
                style = addStyle(style, "background-size", background.size || "auto");
                style = addStyle(style, "background-position", background.position || "0px");
                break;
            }
            case CSSBackgroundType.LINEAR_GRADIENT: {
                style = addStyle(style, "background-image", stringifyCSSBackground(background));
                break;
            }
            case CSSBackgroundType.SOLID: {
                style = addStyle(style, "background-image", stringifyCSSBackground(background));
                break;
            }
        }
    }
    return style;
};
const addStyle = (style, key, value) => {
    if (!value) {
        return style;
    }
    if (!style[key]) {
        return Object.assign(Object.assign({}, style), { [key]: value });
    }
    else {
        return Object.assign(Object.assign({}, style), { [key]: style[key] + ", " + value });
    }
};
var TokenType;
(function (TokenType) {
    TokenType[TokenType["KEYWORD"] = 0] = "KEYWORD";
    TokenType[TokenType["L_PAREN"] = 1] = "L_PAREN";
    TokenType[TokenType["WHITESPACE"] = 2] = "WHITESPACE";
    TokenType[TokenType["R_PAREN"] = 3] = "R_PAREN";
    TokenType[TokenType["COMMA"] = 4] = "COMMA";
    TokenType[TokenType["NUMBER"] = 5] = "NUMBER";
    TokenType[TokenType["CHAR"] = 6] = "CHAR";
    TokenType[TokenType["APOS"] = 7] = "APOS";
    TokenType[TokenType["QUOTE"] = 8] = "QUOTE";
})(TokenType || (TokenType = {}));
class Tokenizer {
    constructor(_scanner) {
        this._scanner = _scanner;
        this._stack = [];
    }
    ended() {
        return this._scanner.ended() && !this._stack.length;
    }
    putBack() {
        this._stack.unshift(this.current());
    }
    next() {
        if (this._stack.length === 0) {
            this._stack.push(this._next());
        }
        return this._stack.shift();
    }
    eatWhitespace() {
        if (!this.ended() && this.peek(1).type === TokenType.WHITESPACE) {
            this.next();
        }
    }
    peek(count = 1) {
        let diff = count - this._stack.length;
        while (diff > 0) {
            this._stack.push(this._next());
            diff--;
        }
        return this._stack[0];
    }
    _next() {
        const c = this._scanner.next();
        // whitespace
        if (/[\s\r\n\t]/.test(c)) {
            return {
                type: TokenType.WHITESPACE,
                value: c + this._scanner.scan(/^[\s\n\r\t]+/)
            };
        }
        if (c === '"')
            return {
                type: TokenType.QUOTE,
                value: c
            };
        if (c === "'")
            return {
                type: TokenType.APOS,
                value: c
            };
        if (c === "(")
            return {
                type: TokenType.L_PAREN,
                value: c
            };
        if (c === ")")
            return {
                type: TokenType.R_PAREN,
                value: c
            };
        if (/[a-zA-Z_-]/.test(c))
            return {
                type: TokenType.KEYWORD,
                value: c + this._scanner.scan(/^[a-zA-Z_-]+/)
            };
        if (/[0-9\.]/.test(c))
            return {
                type: TokenType.NUMBER,
                value: c + this._scanner.scan(/^[0-9\.]+/)
            };
        if (c === ",")
            return {
                type: TokenType.COMMA,
                value: c
            };
        return {
            type: TokenType.CHAR,
            value: c
        };
    }
    current() {
        return this._stack[0];
    }
}
class Scanner {
    constructor(_source) {
        this._source = _source;
        this._position = 0;
    }
    next() {
        return this.scan(/./);
    }
    ended() {
        return this._position >= this._source.length;
    }
    scan(pattern) {
        const match = this._source.substr(this._position).match(pattern);
        if (!match) {
            return "";
        }
        const value = match[0];
        this._position += value.length;
        return value;
    }
}
//# sourceMappingURL=state.js.map