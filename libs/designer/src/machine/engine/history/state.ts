export type History = {
  pathname: string;
  query: any;
};

export type HistoryEngineState = {
  history: History;
};

export const getHistoryState = (): History => ({
  pathname: location.pathname,
  query: Object.fromEntries(new URLSearchParams(location.search)),
});

export const INITIAL_HISTORY_STATE: HistoryEngineState = {
  history: getHistoryState(),
};
