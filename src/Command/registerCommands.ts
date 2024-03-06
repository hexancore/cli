import type { Command, CommandUnknownOpts } from '@commander-js/extra-typings';
import { StdErrors, type AR } from '@hexancore/common';
import type { Container } from 'inversify';
import { HcModuleHelper, ProjectHelper, PromptHelper, printError, styles } from '../Util';
import { MakeModuleCommandHandler } from './Make/MakeModuleCommandHandler';
import { MakeModuleMessageCommandHandler } from './Make/MakeModuleMessageCommandHandler';
import { PulumiMakeProjectCommandHandler } from './Pulumi/MakeProject/PulumiMakeProjectCommandHandler';

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

function make(cli: Command, c: Container): void {
  const make  = cli.command('make').description('display subcommand list');
  makeModule(make, c);
  makeModuleMessage(make, c);
}

function pulumi(cli: Command, c: Container): void {
  const pulumi = cli.command('pulumi').description('display subcommand list');
  const make = pulumi.command('make').description('[project]');

  const makeProjectCommand = new PulumiMakeProjectCommandHandler(c.get(ProjectHelper), c.get(PromptHelper));

  make.command('project')
    .description('Creates Pulumi project')
    .option('--dryRun', 'Prints files and dirs to create', false)
    .action((options) => actionWrapper(() => makeProjectCommand.execute(options)));
}

export default function (cli: Command, c: Container): void {
  cli.configureHelp({
    subcommandTerm: (cmd: CommandUnknownOpts) => {
      return styles.primary(cmd.name());
    }
  });
  make(cli, c);
  pulumi(cli, c);
}
