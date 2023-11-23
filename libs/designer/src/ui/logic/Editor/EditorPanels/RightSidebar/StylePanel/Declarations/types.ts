export namespace css {
  export enum InputType {
    Unit = "unit",
    Enum = "enum",
    Color = "color",
    Group = "group",
    Asset = "asset",
    Raw = "raw",
  }

  export type BaseInput<Type extends InputType> = {
    name?: string;
    type: Type;
  };

  export type UnitInput = BaseInput<InputType.Unit>;
  export type AssetInput = BaseInput<InputType.Asset>;
  export type RawInput = BaseInput<InputType.Raw>;
  export type ColorInput = BaseInput<InputType.Color>;
  export type GroupInput = { inputs: Input[] } & BaseInput<InputType.Group>;
  export type EnumInput = {
    options: string[];
  } & BaseInput<InputType.Enum>;

  export type Input =
    | UnitInput
    | AssetInput
    | RawInput
    | ColorInput
    | EnumInput
    | GroupInput;
}

export namespace schema {
  type BaseInput = {};

  export type DisplayWhen = {
    name: string;
    value: RegExp;
  };

  export type Field<Input extends BaseInput> = {
    name?: string;
    group?: string;

    // alias property to use instead
    alias?: string;

    // Is this a list? E.g: background
    list?: boolean;

    // Properties to join together
    join?: Record<string, string[]>;

    input?: Input;
  };

  export type Map<Input extends BaseInput> = Field<Input>[];
}

export type NewDeclValue = {
  imports?: Record<string, string>;
  value: string;
};
