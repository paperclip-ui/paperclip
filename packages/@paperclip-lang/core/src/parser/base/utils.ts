export const isDigit = (value: string) => {
  const c = value.charCodeAt(0);
  return c > 47 && c < 58;
};

export const isLetter = (value: string) => {
  const c = value.charCodeAt(0);
  return (c > 96 && c < 123) || (c > 64 && c < 91);
};

export const isWhitespace = (value: string) => {
  const c = value.charCodeAt(0);
  return c === 10 || c === 9 || c === 13 || c === 32;
};
