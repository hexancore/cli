import { ERR, type AR } from '@hexancore/common';
import { injectable } from 'inversify';
import { ProjectError, printInfo, styles, type Code, AbstractCommandHandler } from '../../Util';

interface PulumiGenerateProjectCommandOptions {
  dryRun?: true;
}

const PULUMI_PROJECTS_DIR = 'projects';

@injectable()
export class PulumiGenerateProjectCommandHandler extends AbstractCommandHandler<PulumiGenerateProjectCommandOptions> {

  public execute(options: PulumiGenerateProjectCommandOptions, _args: string[]): AR<void> {
    return this.prompt().onOk((promptResult) => {
      const project = promptResult.project;
      const projectPath = PULUMI_PROJECTS_DIR + '/' + project;

      printInfo(`Creating project ${project} in ${projectPath}`);
      return this.createCode(project, projectPath).onOk((code) => {
        if (options.dryRun) {
          return code.print();
        } else {
          return code.save();
        }
      });
    });
  }

  private prompt(): AR<{ project: string; }> {
    return this.helpers.prompt({
      project: {
        type: 'input',
        message: 'New pulumi project name',
        required: true,
        validate: async (input: string) => {
          const path = PULUMI_PROJECTS_DIR + '/' + input;
          const result = await this.helpers.projectHelper.getProjects()
            .onOk((list) => list.includes(path) ? ERR(ProjectError.exists('')) : true)
            .onErr((e) => styles.danger(e.message));
          return result.v;
        }
      },
    });
  }

  private createCode(project: string, projectPath: string): AR<Code> {
    const context = {
      project,
      projectPath,
    };
    return this.helpers.projectHelper.getCode(projectPath, 'Pulumi/MakeProject', context).onOk((code) => {
      this.createCodeDirs(code);
      this.createCodeFiles(code);
      return code;
    });
  }

  private createCodeDirs(code: Code): void {
    const dirs = [
      'src',
      'test/unit',
    ];

    dirs.forEach((path) => code.dir(path, true));
  }

  private createCodeFiles(code: Code): void {
    code.templateFile('package.json');
    code.templateFile('project.json');
    code.templateFile('Pulumi.yaml');

    code.templateFile('tsconfig.json');
    code.templateFile('tsconfig.build.json');
    code.templateFile('tsconfig.test.json');

    code.templateFile('jest.config.ts');
    code.templateFile('test/config.ts');

    code.templateFile('.eslintrc.json');
  }
}
