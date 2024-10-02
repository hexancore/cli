import { Choice } from './../../Util/Prompt/EnquirerTypes';
import type { AR } from '@hexancore/common';
import { AbstractCommandHandler } from '../../Util/Cli/AbstractCommandHandler';
import { CommonHelpers } from '../../Util/CommonHelpers';
import type { AbstractCodeGenerator } from './Generator/AbstractCodeGenerator';
import { printError, PromptHelper } from '../../Util';

export interface GenerateCommandOptions {
  dryRun?: true;
}

export class GenerateCommandHandler extends AbstractCommandHandler<GenerateCommandOptions> {
  private generatorChoices: Choice[];

  public constructor(helpers: CommonHelpers, private generators: Map<string, { choice: Choice, generator: AbstractCodeGenerator; }>) {
    super(helpers);
    this.generatorChoices = Array.from(generators.values()).map(g => g.choice);
  }

  public execute(options: GenerateCommandOptions): AR<void> {
    if (!this.helpers.isMonorepo()) {
      printError('Current directory is not Monorepo(Nx)');
      process.exit(1);
    }
    return this.promptGenerator().onOk((generatorType: string) => {
      const g = this.generators.get(generatorType).generator;
      return g.execute(options);
    });
  }

  private promptGenerator(): AR<string> {
    return this.helpers.promptOne(PromptHelper.autocomplete({
      message: 'What would you like to generate?',
      initial: 0,
      choices: this.generatorChoices,
      suggest(input: string, choices: Choice[]) {
        const found = choices.filter((c) => c.name.toLowerCase().startsWith(input));
        return found;
      }
    }));
  }
}