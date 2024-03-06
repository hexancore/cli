import { OKA, type AR } from '@hexancore/common';
import type { ITemplateEngine } from '../TemplateEngine';

export class TestTemplateEngine implements ITemplateEngine {
  public renderAsync<T extends Record<string, any> = Record<string, any>>(template: string, context: T): AR<string> {
    const content = {
      template,
      context,
    };

    return OKA(JSON.stringify(content));
  }

}