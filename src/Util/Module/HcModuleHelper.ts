import { ERR, ERRA, OK, type AR, type R } from '@hexancore/common';
import { inject, injectable } from 'inversify';
import * as Path from 'path/posix';
import { type Code } from '../Code';
import { CommonHelpers } from '../CommonHelpers';
import { ProjectHelper } from '../Project';
import type { MultiPromptOptions } from '../Prompt/EnquirerTypes';
import { HcModuleError } from './HcModuleError';

const MODULE_NAME_REGEX = /^[A-Z][a-zA-Z0-9]+$/;

export interface ProjectModuleInfo {
  project: string,
  module: string,
}

@injectable()
export class HcModuleHelper {
  public constructor(
    @inject(CommonHelpers) private helpers: CommonHelpers,
    @inject(ProjectHelper) private projectHelper: ProjectHelper,
  ) {

  }

  /**
   * Checks is name and module directory exists
   * @param project
   * @param module
   * @returns
   */
  public checkExists(project: string, module: string): R<boolean> {
    return this.checkName(module)
      .onOk(() => this.isExists(project, module)
        .onOk(exists => exists ? true : this.getModulePath(project, module)
          .onOk(modulePath => ERR(HcModuleError.notExists(modulePath)))
        )
      );
  }

  /**
   * Only checks given name is in valid format
   * @param name
   * @returns
   */
  public checkName(name: string): R<boolean> {
    if (!MODULE_NAME_REGEX.test(name)) {
      return ERR(HcModuleError.invalidName());
    }

    return OK(true);
  }

  /**
   * Returns true when module directory exists.
   * @param name
   * @param projectPath
   * @returns
   */
  public isExists(name: string, projectPath: string): R<boolean> {
    return this.getModulePath(name, projectPath).onOk((modulePath) => this.helpers.fs.pathExists(modulePath));
  }

  public getModuleCode(projectModule: ProjectModuleInfo, templateRoot: string): Code {
    return this.helpers.getCode({
      ...projectModule,
      templateRoot,
      context: {
        moduleName: projectModule.module,
        moduleImportName: projectModule.module
      }
    });
  }

  public getModulePath(name: string, project: string): R<string> {
    return this.getProjectPath(project).onOk((projectPath) => Path.join(projectPath, 'src', name));
  }

  public getProjectPath(project: string): R<string> {
    return this.projectHelper.getProjectPath(project);
  }

  public promptProject(): AR<string> {
    return this.projectHelper.promptProject();
  }

  public promptProjectAndModule(): AR<ProjectModuleInfo> {
    return this.promptProject()
      .onOk(project => this.getProjectModulePromptOptions(project)
        .onOk(projectModulePrompt => this.helpers.prompt({ module: projectModulePrompt })
          .onOk(projectModulePromptResult => ({ project, module: projectModulePromptResult.module })))
      );
  }

  private getProjectModulePromptOptions(project?: string): AR<MultiPromptOptions> {
    return this.getModules(project).onOk((modules) => {
      if (modules.length === 0) {
        return ERR(HcModuleError.noProjectModules(project, this.getProjectPath(project).v));
      }
      return {
        type: 'autocomplete',
        message: 'Select Module',
        initial: 0,
        choices: modules,
      };
    });
  }

  public getModules(project?: string): AR<string[]> {
    if (this.isMonorepo() && project === undefined) {
      return ERRA(HcModuleError.emptyProject());
    }

    return this.getProjectPath(project).onOk(projectPath => {
      const dir = Path.join(projectPath, 'src') + '/*';
      return this.helpers.fs.fastGlob(dir, { deep: 1, onlyDirectories: true })
        .onOk((modulePaths) => modulePaths.map(modulePath => Path.basename(modulePath)).sort());
    });
  }

  public isMonorepo(): boolean {
    return this.projectHelper.isMonorepo();
  }
}
