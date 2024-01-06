import { Dispatch } from "@paperclip-ui/common";
import { Mutation } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { DesignerEngineEvent } from "../domains/api/events";
import { Range } from "@paperclip-ui/proto/lib/generated/ast/base";

import { FSItemKind } from "../state";

export type APIActions = ReturnType<typeof createAPIActions>;

export type CreateClientOptions = {
  protocol?: string;
  host: string;
  transport?: any;
};

export const createClient = (
  { protocol, host, transport }: CreateClientOptions,
  dispatch: Dispatch<DesignerEngineEvent>
) => {
  const impl = new GrpcWebImpl((protocol || "http:") + "//" + host, {
    transport,
  });
  const client = new DesignerClientImpl(impl);

  return createAPIActions(client, dispatch);
};

/**
 * All of the imperative actions that can be invoked in the engine
 */

const createAPIActions = (
  client: DesignerClientImpl,
  dispatch: Dispatch<DesignerEngineEvent>
) => {
  const openFile = async (filePath: string) => {
    const data = await client.OpenFile({ path: filePath });
    dispatch({ type: "designer-engine/documentOpened", payload: data });
  };

  const readDirectory = async (inputPath: string) => {
    const { items, path } = await client.ReadDirectory({ path: inputPath });
    dispatch({
      type: "designer-engine/directoryRead",
      payload: { items, path, isRoot: inputPath === "." },
    });
  };

  const expandFilePathDirectories = async (filePath: string) => {
    const dirs = filePath.split("/");

    // pop off file name
    dirs.pop();
    while (dirs.length) {
      try {
        await readDirectory(dirs.join("/"));

        // outside of project scope
      } catch (e) {
        break;
      }
      dirs.pop();
    }
  };

  return {
    openFile,
    readDirectory,
    expandFilePathDirectories,
    async deleteFile(filePath: string) {
      // no need to do anything else since file watcher trigger changes
      await client.DeleteFile({ path: filePath });
    },
    async moveFile(fromPath: string, toPath: string) {
      // no need to do anything else since file watcher will trigger changes
      await client.MoveFile({ fromPath, toPath });

      dispatch({
        type: "designer-engine/fileMoved",
        payload: { fromPath, toPath },
      });
    },
    async createDirectory(name: string, parentDir?: string) {
      const filePath = parentDir + "/" + name;

      // // kebab case in case spaces are added
      await client.CreateFile({
        path: filePath,
        kind: FSItemKind.Directory,
      });

      dispatch({
        type: "designer-engine/fileCreated",
        payload: { filePath, kind: FSItemKind.Directory },
      });
    },
    async createDesignFile(name: string, parentDir?: string) {
      const { filePath } = await client.CreateDesignFile({
        name,
        parentDir,
      });
      dispatch({
        type: "designer-engine/designFileCreated",
        payload: { filePath },
      });
    },
    syncEvents() {
      client.OnEvent({}).subscribe({
        next(event) {
          dispatch({ type: "designer-engine/serverEvent", payload: event });
        },
        error: () => {
          dispatch({ type: "designer-engine/apiError" });
        },
      });
    },
    async copyExpression(expressionId: string) {
      const result = await client.CopyExpression({ expressionId });
      return result.content;
    },
    openCodeEditor(path: string, range?: Range) {
      client.OpenCodeEditor({ path, range });
    },
    openFileInNavigator(filePath: string) {
      client.OpenFileInNavigator({ filePath });
    },
    syncResourceFiles() {
      client.GetResourceFiles({}).subscribe({
        next(data) {
          dispatch({
            type: "designer-engine/resourceFilePathsLoaded",
            payload: data.filePaths,
          });
        },
        error: () => {
          dispatch({ type: "designer-engine/apiError" });
        },
      });
    },
    undo() {
      client.Undo({});
    },
    redo() {
      client.Redo({});
    },
    save() {
      client.Save({});
    },
    syncGraph() {
      client.GetGraph({}).subscribe({
        next(data) {
          dispatch({ type: "designer-engine/graphLoaded", payload: data });
        },
        error: () => {},
      });
    },
    async applyChanges(mutations: Mutation[]) {
      const changes = await client.ApplyMutations({ mutations }, null);
      dispatch({ type: "designer-engine/changesApplied", payload: changes });
      return changes;
    },
    async saveFile(path: string, content: Uint8Array) {
      await client.SaveFile({ path, content }, null);
    },
    async loadProjectInfo() {
      const info = await client.GetProjectInfo({}, null);
      dispatch({ type: "designer-engine/ProjectInfoResult", payload: info });
      return info;
    },
    async searchFiles(query: string) {
      const { items, rootDir } = await client.SearchResources({ query }, null);

      dispatch({
        type: "designer-engine/fileSearchResult",
        payload: { items, rootDir },
      });
    },
  };
};
