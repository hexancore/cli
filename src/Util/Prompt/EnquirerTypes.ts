import type Enquirer from 'enquirer';


export interface BasePromptOptions {
  name: string | (() => string);
  type: string | (() => string);
  message: string | (() => string) | (() => Promise<string>);
  prefix?: string;
  initial?: any;
  required?: boolean;
  enabled?: boolean | string;
  disabled?: boolean | string;
  format?(value: string): string | Promise<string>;
  result?(value: string): string | Promise<string>;
  skip?: ((state: object) => boolean | Promise<boolean>) | boolean;
  validate?(value: string): boolean | string | Promise<boolean | string>;
  onSubmit?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>;
  onCancel?(name: string, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>;
  stdin?: NodeJS.ReadStream;
  stdout?: NodeJS.WriteStream;
}

export interface Choice<V = unknown> {
  name: string;
  message?: string;
  value?: V;
  hint?: string;
  role?: string;
  enabled?: boolean;
  disabled?: boolean | string;
}

export interface ArrayPromptOptions extends BasePromptOptions {
  type:
  | 'autocomplete'
  | 'editable'
  | 'form'
  | 'multiselect'
  | 'select'
  | 'survey'
  | 'list'
  | 'scale';
  choices: (string | Choice)[];
  maxChoices?: number;
  multiple?: boolean;
  initial?: number;
  delay?: number;
  separator?: boolean;
  sort?: boolean;
  linebreak?: boolean;
  edgeLength?: number;
  align?: 'left' | 'right';
  scroll?: boolean;
  pointer?: (choice: Choice, i: number) => string;
  margin?: [number, number, number, number];
}

export interface BooleanPromptOptions extends BasePromptOptions {
  type: 'confirm';
  initial?: boolean;
}

export interface StringPromptOptions extends BasePromptOptions {
  type: 'input' | 'invisible' | 'list' | 'password' | 'text';
  initial?: string;
  multiline?: boolean;
}

export interface NumberPromptOptions extends BasePromptOptions {
  type: 'numeral';
  min?: number;
  max?: number;
  delay?: number;
  float?: boolean;
  round?: boolean;
  major?: number;
  minor?: number;
  initial?: number;
}

export interface SnippetPromptOptions extends BasePromptOptions {
  type: 'snippet';
  newline?: string;
  template?: string;
}

export interface SortPromptOptions extends BasePromptOptions {
  type: 'sort';
  hint?: string;
  drag?: boolean;
  numbered?: boolean;
}

export interface AutoCompletePromptOptions extends ArrayPromptOptions {
  suggest?: (input: string, choices: Choice[]) => Choice[];
  hint?: () => string;
  highlight?: (choice: string) => string;
  choiceMessage?: (choice: Choice, i: number) => string;
}

export type PromptOptions =
  | BasePromptOptions
  | ArrayPromptOptions
  | BooleanPromptOptions
  | StringPromptOptions
  | NumberPromptOptions
  | SnippetPromptOptions
  | SortPromptOptions;

export type MultiPromptOptions<Base extends PromptOptions = PromptOptions> = Omit<Base, 'name'>;