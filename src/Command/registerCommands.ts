import type { Command, CommandUnknownOpts } from '@commander-js/extra-typings';
import { StdErrors, type AR } from '@hexancore/common';
import type { Container } from 'inversify';
import { FilesystemHelper, HcModuleHelper, ProjectHelper, PromptHelper, printError, styles } from '../Util';
import { MakeModuleCommandHandler } from './Make/MakeModuleCommandHandler';
import { MakeModuleMessageCommandHandler } from './Make/MakeModuleMessageCommandHandler';
import { PulumiMakeProjectCommandHandler } from './Pulumi/MakeProject/PulumiMakeProjectCommandHandler';
import { PackageBumpVersionCommandHandler } from './Package/PackageBumpVersionCommandHandler';

async function actionWrapper(action: () => AR<void>): Promise<void> {
  (await action()).onErr((e) => {
    if (e.type === StdErrors.internal && !e.error) {
      return;
    }

    printError(JSON.stringify(e.getLogRecord()));
  });
}

function makeModule(cli: Command, c: Container): void {
  const command = c.get(MakeModuleCommandHandler);
  cli
    .command('module')
    .description('Creates new module')
    .option('--dryRun', 'Prints files and dirs to create', false)
    .action((options) => actionWrapper(() => command.execute(options)));
}

function makeModuleMessage(cli: Command, c: Container): void {
  const command = new MakeModuleMessageCommandHandler(c.get(HcModuleHelper), c.get(PromptHelper));
  cli
    .command('message')
    .description('Creates new module application message')
    .option('--dryRun', 'Prints files and dirs to create', false)
    .action((options) => actionWrapper(() => command.execute(options)));
}

function makeCommands(cli: Command, c: Container): void {
  const make = cli.command('make').description('display subcommand list');
  makeModule(make, c);
  makeModuleMessage(make, c);
}

function pulumiCommands(cli: Command, c: Container): void {
  const pulumi = cli.command('pulumi').description('display subcommand list');
  const make = pulumi.command('make').description('[project]');

  const makeProjectCommand = new PulumiMakeProjectCommandHandler(c.get(ProjectHelper), c.get(PromptHelper));

  make.command('project')
    .description('Creates Pulumi project')
    .option('--dryRun', 'Prints files and dirs to create', false)
    .action((options) => actionWrapper(() => makeProjectCommand.execute(options)));
}

function packageCommands(cli: Command, c: Container): void {
  const commandGroup = cli.command('package').description('display subcommand list');
  commandGroup.command('bump-version')
    .description('Bumps package version')
    .option('--dryRun', 'Prints updated files', false)
    .argument('newVersion', 'new version of package')
    .action((newVersion, options) => actionWrapper(() => {
      const handler = new PackageBumpVersionCommandHandler(c.get(FilesystemHelper));
      return handler.execute({ newVersion, ...options });
    }));
}

export default function (cli: Command, c: Container): void {
  cli.configureHelp({
    subcommandTerm: (cmd: CommandUnknownOpts) => {
      return styles.primary(cmd.name());
    }
  });
  makeCommands(cli, c);
  pulumiCommands(cli, c);
  packageCommands(cli, c);
}
