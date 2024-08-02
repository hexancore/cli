import { ARW, type AR } from '@hexancore/common';
import type Enquirer from 'enquirer';
import type { AutoCompletePromptOptions, Choice, MultiPromptOptions, PromptOptions, StringPromptOptions } from './EnquirerTypes';
import { styles, type ConsoleTheme } from '../ConsoleHelper';
import { StringHelper } from '../StringHelper';

const NAME_REGEX = /^[A-Z][a-zA-Z0-9]+$/;

export function validateName(input: string): string | true {
  return NAME_REGEX.test(input) ? true :
    styles.danger('Must be only letters, digits and starts with upper letter');
}

export class PromptHelper {
  public constructor(private enquirer: Enquirer) {
  }

  public prompt<QRS extends Record<string, MultiPromptOptions>, RT extends Record<keyof QRS, any>>(questions: QRS): AR<RT> {
    const prompts = [];
    for (const q in questions) {
      const prompt: PromptOptions = questions[q] as any;
      prompt.name = q;
      prompts.push(prompt);
    }

    return ARW(this.enquirer.prompt(prompts)) as any;
  }

  public promptOne<R>(question: MultiPromptOptions): AR<R> {
    return this.prompt({ question }).onOk(r => r.question);
  }

  public static styles(): ConsoleTheme {
    return styles;
  }

  public static autocomplete(options: Omit<AutoCompletePromptOptions, 'type' | 'name'> & { allowNew?: boolean; }): MultiPromptOptions<AutoCompletePromptOptions> {
    let suggest = undefined;
    if (options.allowNew) {
      let newContextChoice = null;
      let allContextChoices = null;
      const newLabel = styles.hintChoiceText(' <New>');
      suggest = function (input: string) {
        input = StringHelper.upperFirst(input);
        if (!newContextChoice) {
          newContextChoice = { value: '', message: '', name: '' };
          allContextChoices = this.choices;
          if (allContextChoices.length === 0) {
            newContextChoice.name = input;
            newContextChoice.message = input + newLabel;
            return [newContextChoice];
          }
        }

        const found: any[] = input != '' ? allContextChoices.filter(v => v.name.startsWith(input)) : allContextChoices;
        if (found.length === 0) {
          newContextChoice.name = input;
          newContextChoice.message = input + newLabel;
          newContextChoice.value = input;
          return [newContextChoice];
        }
        return found;
      };
    }

    return {
      type: 'autocomplete',
      initial: 0,
      required: true,
      validate: validateName,
      suggest,
      hint() {
        if (!this.visible.length && !this.input) {
          return 'start typing to create first';
        }
      },
      highlight: text => styles.selectHighlight(text),
      pointer(_choice, i) {
        return this.state.index === i ? styles.selectPointer : ' ';
      },
      choiceMessage(choice: Choice, i) {
        return this.state.index === i ? styles.selected(choice.message) : choice.message;
      },
      ...options
    };
  }

  public static simpleNameInput(): MultiPromptOptions<StringPromptOptions> {
    return {
      type: 'input',
      message: 'Name',
      required: true,
      validate: validateName
    };
  }
}