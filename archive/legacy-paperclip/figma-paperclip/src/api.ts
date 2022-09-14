import * as https from "https";
import * as qs from "querystring";
import { httpGet } from "./utils";

export class FigmaApi {
  private _limits = {};
  constructor(readonly personalAccessToken: string) {}
  getFile(fileKey: string, options: any = {}) {
    return this._get(
      `/v1/files/${fileKey}`,
      { geometry: "paths", ...options },
      "getFile"
    );
  }
  getStyles(fileKey: string, options: any = {}) {
    return this._get(`/v1/files/${fileKey}/styles`, options, "getStyles");
  }
  getStyle(styleKey: string, options: any = {}) {
    return this._get(`/v1/styles/${styleKey}`, options, "getStyles");
  }

  getVersions(fileKey: string) {
    return this._get(`/v1/version/${fileKey}`, {}, "getVersions");
  }
  getTeamProjects(teamId: string) {
    return this._get(`/v1/teams/${teamId}/projects`, {}, "getTeamProjects");
  }
  getProjectFiles(projectId: number) {
    return this._get(`/v1/projects/${projectId}/files`, {}, "getProjectFiles");
  }
  getImage(fileKey: string, options: any) {
    return this._get(`/v1/images/${fileKey}`, options, "getImage");
  }
  getComponent(key: string) {
    return this._get(`/v1/components/${key}`, {}, "getComponent");
  }
  getImageFills(key: string) {
    return this._get(`/v1/files/${key}/images`, {}, "getImageFills");
  }

  private _get(
    pathname: string,
    query: Record<string, string> = {},
    limitName: string
  ) {
    if (!this._limits[limitName]) {
      this._limits[limitName] = figmaRateLimiter();
    }

    const limit = this._limits[limitName];

    return limit(async (retry) => {
      const search = Object.keys(query).length ? "?" + qs.stringify(query) : "";
      try {
        return await httpGet({
          headers: {
            "X-FIGMA-TOKEN": this.personalAccessToken,
          },
          hostname: "api.figma.com",
          path: pathname + search,
        });
      } catch (e) {
        if (e.status === 429) {
          return await retry();
        } else {
          throw e;
        }
      }
    });
  }
}

const figmaRateLimiter = () => {
  const run = (cb: (retry) => Promise<any>) => {
    const retry = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          call().then(resolve, reject);
        }, 1000 * 60);
      });
    };

    const call = () =>
      new Promise((resolve, reject) => {
        cb(retry).then(resolve, reject);
      });

    return call();
  };

  return run;
};
