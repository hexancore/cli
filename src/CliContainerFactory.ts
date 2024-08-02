import { Eta } from 'eta';
import { Container } from 'inversify';
import { DI } from './Constants';
import * as path from 'path/posix';
import { EtaTemplateEngine } from './Util/TemplateEngine';
import { existsSync } from 'fs-extra';
import Enquirer from 'enquirer';
import { PromptHelper } from './Util/Prompt/PromptHelper';
import { NxHelper } from './Util/Nx/NxHelper';
import { printInfo, styles } from './Util/ConsoleHelper';
import { CommonHelpers } from './Util/CommonHelpers';
import { generatorsContainerBindFactory } from './Command/Generate/Generator';

export class CliContainerFactory {

  private c: Container;

  private constructor(cwd: string) {
    this.c = new Container({ defaultScope: 'Singleton', autoBindInjectable: true });
    this.bindRootDir(cwd);
  }

  public static create(cwd: string): Container {
    const factory = new CliContainerFactory(cwd);
    return factory.build();
  }

  private build(): Container {
    this.bindTemplateEngine();
    this.bindMonorepoHelper();
    this.bindPromptHelper();
    this.bindCommonHelpers();
    this.bindGenerators();
    return this.c;
  }

  private bindRootDir(cwd: string): void {
    this.c.bind('isMonorepoRootDir').toConstantValue(!existsSync(path.join(cwd, 'src')));
    this.c.bind(DI.rootDir).toConstantValue(cwd);
  }

  private bindMonorepoHelper(): void {
    const rootDir: string = this.c.get(DI.rootDir);
    if (NxHelper.isNxMonorepo(rootDir)) {
      this.c.bind(DI.monorepoHelper).toService(NxHelper);
    }
  }

  private bindTemplateEngine(): void {
    const cliRootDir = path.dirname(path.dirname(__filename.replaceAll('\\', '/')));
    const eta = new Eta({
      views: path.join(cliRootDir, 'templates'),
      autoEscape: false,
      autoTrim: false
    });

    this.c.bind(DI.templateEngine).toConstantValue(new EtaTemplateEngine(eta));
  }

  private bindPromptHelper(): void {
    const enquire = new Enquirer({
      onCancel: () => {
        printInfo(styles.primary('Operation canceled'));
      }
    });
    this.c.bind(PromptHelper).toConstantValue(new PromptHelper(enquire));
  }

  private bindCommonHelpers() {
    this.c.bind(CommonHelpers).toSelf();
  }

  private bindGenerators(): void {
    this.c.bind(DI.generators).toDynamicValue(generatorsContainerBindFactory);
  }
}