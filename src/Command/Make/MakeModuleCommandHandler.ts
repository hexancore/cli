import { injectable } from 'inversify';
import * as Path from 'path/posix';
import { HcModuleHelper, printInfo, styles, type ProjectModuleInfo, type Code } from '../../Util';
import { ERR, type AR } from '@hexancore/common';
import { HcModuleError, PromptHelper } from '../../Util';

interface MakeModuleCommandOptions {
  dryRun?: true;
}

@injectable()
export class MakeModuleCommandHandler {
  public constructor(
    private moduleHelper: HcModuleHelper,
    private promptHelper: PromptHelper,
  ) {
  }

  public execute(options: MakeModuleCommandOptions): AR<void> {
    return this.prompt().onOk((projectModule: ProjectModuleInfo) => {
      printInfo(`Creating module ${projectModule.module} in ${projectModule.project}`);
      const code = this.createCode(projectModule);
      code.save(options.dryRun);
    });
  }

  private prompt(): AR<ProjectModuleInfo> {
    return this.moduleHelper.promptProject()
      .onOk((project) => this.promptModuleName(project));
  }

  private promptModuleName(project: string): AR<ProjectModuleInfo> {
    return this.promptHelper.prompt({
      module: {
        type: 'input',
        message: 'New module name',
        required: true,
        validate: (input) => {
          const result = this.moduleHelper.checkName(input)
            .onOk(() => this.moduleHelper.isExists(input, project)
              .onOk(exists => exists ? this.moduleHelper.getModulePath(input, project)
                .onOk(path => ERR(HcModuleError.exists({ project: project, module: input }, path))) : true))
            .onErr((e) => styles.danger(e.message));
          return result.v;
        }
      }
    }).onOk((modulePromptResult) => ({ project, module: modulePromptResult.module }));
  }

  private createCode(projectModule: ProjectModuleInfo): Code {
    const content = this.moduleHelper.getModuleCode(projectModule, 'MakeModule');
    this.createDirs(content);
    this.createFiles(content);

    return content;
  }

  private createDirs(code: Code): void {
    const srcDirs = [
      'Application/Command',
      'Application/Event',
      'Application/Query',
      'Domain',
      'Infrastructure/Service',
      'Infrastructure/Persistence',
    ].map((path) => Path.join('src', code.module, path));

    const testDirs = [
      'unit',
      'integration',
      'functional'
    ].map((path) => Path.join('test', path, code.module));

    srcDirs.concat(testDirs).forEach((path) => code.dir(path, true));
  }

  private async createFiles(content: Code): Promise<void> {
    content.srcTemplateFile('Application/PrivateApplicationModule.ts', `Application/${content.moduleClassPrefix}PrivateApplicationModule.ts`);
    content.srcTemplateFile('Application/PublicApplicationModule.ts', `Application/${content.moduleClassPrefix}PublicApplicationModule.ts`);
    content.srcEmptyFile('Application/index.ts');
    content.srcEmptyFile('Domain/index.ts');
    content.srcTemplateFile(
      'Infrastructure/PrivateInfrastructureModule.ts',
      `Infrastructure/${content.moduleClassPrefix}PrivateInfrastructureModule.ts`,
    );
    content.srcTemplateFile('index.ts', 'index.ts');
    content.srcTemplateFile('Module.ts', `${content.moduleClassPrefix}Module.ts`);

  }
}
