import { Command } from '@commander-js/extra-typings';
import 'reflect-metadata';
import registerCommands from './Command/registerCommands';
import { CLI_VERSION, DI } from './Constants';
import { HcCliContainerBuilder } from './DI';
import { styles, type IMonorepoHelper } from './Util';

function main() {
  const cli = new Command();
  cli.name('Hexancore CLI')
    .description('CLI to speedup work with Hexancore')
    .version(CLI_VERSION);

  const cwd = process.cwd().replaceAll('\\', '/');
  const c = HcCliContainerBuilder.create(cwd).build();

  if (!c.get<IMonorepoHelper>(DI.monorepoHelper).isMonorepoRootDir(cwd)) {
    console.log(styles.danger('Current dir is not monorepo root dir!'));
    return;
  }
  registerCommands(cli, c);
  return cli.parseAsync(process.argv);
}

try {
  main();
} catch (error) {
  console.error(error);
}
