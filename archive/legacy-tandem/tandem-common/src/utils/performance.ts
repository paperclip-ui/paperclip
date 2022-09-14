export const pmark = (label: string) => {
  if (process.env.NODE_ENV !== "development") {
    return {
      end() {},
    };
  }
  performance.mark(`start ${label}`);
  return {
    end() {
      performance.mark(`end ${label}`);
      performance.measure(`${label}`, `start ${label}`, `end ${label}`);
    },
  };
};
