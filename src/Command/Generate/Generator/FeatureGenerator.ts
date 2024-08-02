import { ERR, type AR } from '@hexancore/common';
import { injectable } from 'inversify';
import * as Path from 'path/posix';
import { FeatureError, printInfo, styles, type Code, type ProjectFeatureInfo } from '../../../Util';
import { AbstractCodeGenerator } from './AbstractCodeGenerator';

interface FeatureGeneratorOptions {
  dryRun?: true;
}

@injectable()
export class FeatureGenerator extends AbstractCodeGenerator {

  public execute(options: FeatureGeneratorOptions): AR<void> {
    return this.prompt().onOk((projectModule: ProjectFeatureInfo) => {
      printInfo(`Creating feature ${projectModule.feature} in ${projectModule.project}`);
      const code = this.createCode(projectModule);
      return code.save(options.dryRun);
    });
  }

  private prompt(): AR<ProjectFeatureInfo> {
    return this.helpers.projectHelper.promptProject()
      .onOk((project) => this.promptName(project));
  }

  private promptName(project: string): AR<ProjectFeatureInfo> {
    return this.helpers.prompt({
      feature: {
        type: 'input',
        message: 'New Feature name',
        required: true,
        validate: (input) => {
          const result = this.helpers.featureHelper.checkName(input)
            .onOk(() => this.helpers.featureHelper.isExists(input, project)
              .onOk(exists => exists ? this.helpers.featureHelper.getFeaturePath(input, project)
                .onOk(path => ERR(FeatureError.exists({ project: project, feature: input }, path))) : true))
            .onErr((e) => styles.danger(e.message));
          return result.v;
        }
      }
    }).onOk((promptResult) => ({ project, feature: promptResult.feature }));
  }

  private createCode(projectFeature: ProjectFeatureInfo): Code {
    const code = this.helpers.featureHelper.getCode(projectFeature, 'Generate/Feature');
    this.createDirs(code);
    this.createFiles(code);

    return code;
  }

  private createDirs(code: Code): void {
    const srcDirs = [
      'Application',
      'Domain',
      'Infrastructure',
    ].map((path) => Path.join('src', code.feature, path));
    srcDirs.forEach((path) => code.dir(path, false));

    const testDirs = [
      'unit',
      'integration',
      'functional'
    ].map((path) => Path.join('test', path, code.feature));
    testDirs.forEach((path) => code.dir(path, true));
  }

  private async createFiles(content: Code): Promise<void> {
    content.srcTemplateFile('Application/index.ts');

    content.srcTemplateFile('Domain/DomainErrors.ts', `Domain/${content.featureClassPrefix}DomainErrors.ts`);
    content.srcTemplateFile('Domain/index.ts');

    content.srcTemplateFile('Infrastructure/FeatureInfraModule.ts');
    content.srcTemplateFile('Infrastructure/Domain/FeatureDomainInfraModule.ts');

    content.srcTemplateFile('Module.ts', `${content.featureClassPrefix}Module.ts`);

    content.srcTemplateFile('index.ts');
    content.srcTemplateFile('index.backend.ts');
  }
}
