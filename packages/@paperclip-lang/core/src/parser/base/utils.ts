export const isDigit = (value: string) => {
  const c = value.charCodeAt(0);
  return c > 47 && c < 58;
};

export const isLetter = (value: string) => {
  const c = value.charCodeAt(0);
  return (c > 96 && c < 123) || (c > 64 && c < 91);
};

export const isLetterOrDigit = (value: string) =>
  isLetter(value) || isDigit(value);

export const isWhitespace = (value: string) => {
  const c = value.charCodeAt(0);
  return c === 9 || c === 32 || isNewLine(value);
};

export const isNewLine = (value: string) => {
  const c = value.charCodeAt(0);
  return c === 10 || c === 13;
};
