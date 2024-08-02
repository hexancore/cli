import { CliBuilder, CommonHelpers } from '../../Util';
import type { Container } from 'inversify';
import type { Command } from '@commander-js/extra-typings';
import { GenerateCommandHandler } from './GenerateCommandHandler';
import { DI } from '../../Constants';

export function registerGenerateCommand(builder: CliBuilder): void {
  builder.command('g', (command: Command, container: Container) => {
    command
      .option('--dryRun', 'only prints output files')
      .description('code generators');

    const generators: any = container.get(DI.generators);
    return new GenerateCommandHandler(container.get(CommonHelpers), generators);
  });
}