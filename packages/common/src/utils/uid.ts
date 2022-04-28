const crc32 = require("crc32");

export type UIDGenerator = () => string;
// export type ChecksumGenerator<TObject> = (value: TObject) => string;

export const createUIDGenerator = <TObject>(
  seed: string,
  index: number = 0
) => {
  return () => seed + index++;
};

export const generateUID = createUIDGenerator(
  crc32(String(`${Date.now()}.${Math.random()}`))
);
