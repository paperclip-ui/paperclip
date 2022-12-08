export type History = {
  pathname: string;
  query: any;
};

export type HistoryEngineState = {
  history: History;
};

export const getHistoryState = (): History => {
  // Fuck Jest force this to work.
  try {
    return {
      pathname: location?.pathname || "/",
      query: Object.fromEntries(new URLSearchParams(location?.search)),
    };
  } catch (e) {
    return {
      pathname: "/",
      query: {},
    };
  }
};

export const INITIAL_HISTORY_STATE: HistoryEngineState = {
  history: getHistoryState(),
};
