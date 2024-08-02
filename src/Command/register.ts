import type { Command } from '@commander-js/extra-typings';
import { Container } from 'inversify';
import { CliBuilder, CommonHelpers } from '../Util';
import { registerGenerateCommand } from './Generate/register';
import { PackageBumpVersionCommandHandler } from './Package/PackageBumpVersionCommandHandler';
import { PulumiGenerateProjectCommandHandler } from './Pulumi/PulumiGenerateProjectCommandHandler';

function pulumiCommands(builder: CliBuilder): void {

  builder.commandGroup('pulumi').commandGroup('generate')
    .command('project', (def: Command, container: Container) => {
      def
        .description('creates Pulumi project')
        .option('--dryRun', 'prints files and dirs to create', false);
      return new PulumiGenerateProjectCommandHandler(container.get(CommonHelpers));
    });
}

function packageCommands(builder: CliBuilder): void {
  builder.commandGroup('package')
    .command('bump-version', (def: Command, container: Container) => {
      def
        .description('Bumps package version')
        .option('--dryRun', 'Prints updated files', false)
        .argument('newVersion', 'new version of package');
      return new PackageBumpVersionCommandHandler(container.get(CommonHelpers));
    });
}

export default function (builder: CliBuilder): void {
  registerGenerateCommand(builder);
  pulumiCommands(builder);
  packageCommands(builder);
}
