declare const ENVIRONMENT: any;

type Env = {
  host: string;
  protocol: string;
};

const getDefaultEnv = () => {
  try {
    return {
      host: window.location.host,
      protocol: window.location.protocol,
    };
  } catch (e) {
    return {
      host: null,
      protocol: null,
    };
  }
};

export const env: Env =
  typeof ENVIRONMENT != "undefined" ? ENVIRONMENT : getDefaultEnv();
