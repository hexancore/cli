import 'reflect-metadata';
import registerCommands from './Command/register';
import { CLI_VERSION } from './Constants';
import { CliContainerFactory } from './CliContainerFactory';
import { CliBuilder } from './Util/Cli/CliBuilder';
import { Command, CommandUnknownOpts } from '@commander-js/extra-typings';
import {  printError, styles } from './Util/ConsoleHelper';
import { INTERNAL_ERROR } from '@hexancore/common';

async function main() {
  try {
    const cli = new Command();
    cli.name('Hexancore CLI')
      .description('CLI to speedup work with Hexancore')
      .version(CLI_VERSION);

    cli.configureHelp({
      subcommandTerm: (cmd: CommandUnknownOpts) => {
        return styles.primary(cmd.name());
      }
    });

    const cwd = process.cwd().replaceAll('\\', '/');
    const container = CliContainerFactory.create(cwd);

    const cliBuilder = CliBuilder.create(cli, container);
    registerCommands(cliBuilder);

    return await cli.parseAsync(process.argv);
  } catch (error) {
    printError(INTERNAL_ERROR(error));
    process.exit(1);
  }
}

main();
