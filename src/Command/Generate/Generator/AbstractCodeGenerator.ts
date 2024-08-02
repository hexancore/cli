import type { CommonHelpers } from '../../../Util/CommonHelpers';
import type { GenerateCommandOptions } from '../GenerateCommandHandler';
import type { AR } from '@hexancore/common';

export abstract class AbstractCodeGenerator {
  public constructor(protected helpers: CommonHelpers) { }

  public abstract execute(options: GenerateCommandOptions): AR<void>;
}