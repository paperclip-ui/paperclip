export const arraySplice = <T>(
  target: T[],
  index: number,
  count: number = 1,
  ...replacements: T[]
) => [
  ...target.slice(0, index), // [0, 0] [text],
  ...replacements,
  ...target.slice(index + count),
];

export const arrayRemove = <T>(target: T[], value: T) => {
  const i = target.indexOf(value);
  return arraySplice(target, i, 1);
};
