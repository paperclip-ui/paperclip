export const isPublicAction = (action: any) => action["@@public"] === true;

export const publicActionCreator = <TFunc extends Function>(
  createAction: TFunc
) =>
  ((...args) => {
    const action = createAction(...args);
    action["@@public"] = true;
    return action;
  }) as any as TFunc;
