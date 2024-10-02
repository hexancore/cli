import type { CommonHelpers } from '../../Util';
import type { AR } from '@hexancore/common';

export abstract class AbstractCommandHandler<O extends Record<string, any>> {
  public constructor(protected helpers: CommonHelpers) { }

  public abstract execute(options: O, ...args: string[]): AR<void>;
}