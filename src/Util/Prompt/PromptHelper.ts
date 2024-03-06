import { ARW, type AR } from '@hexancore/common';
import type Enquirer from 'enquirer';
import type { MultiPromptOptions, PromptOptions } from './EnquirerTypes';
import { styles, type ConsoleTheme } from '../ConsoleHelper';


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

  public static styles(): ConsoleTheme {
    return styles;
  }
}