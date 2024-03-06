import { ARW, type AR } from '@hexancore/common';
import type { Eta } from 'eta';

export interface ITemplateEngine {
  renderAsync<T extends Record<string, any> = Record<string, any>>(template: string, context: T): AR<string>;
}

export class EtaTemplateEngine implements ITemplateEngine {
  public constructor(private eta: Eta) {

  }
  public renderAsync<T extends Record<string, any> = Record<string, any>>(template: string, context: T): AR<string> {
    return ARW(this.eta.renderAsync(template + '.eta', context));
  }
}