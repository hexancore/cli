import { ERR, OK, OKA, type AR, type R } from '@hexancore/common';
import { inject, injectable } from 'inversify';
import * as Path from 'path/posix';
import type { Code } from '../Code/Code';
import { CommonHelpers } from '../CommonHelpers';
import type { MultiPromptOptions } from '../Prompt/EnquirerTypes';
import { ProjectError } from './ProjectError';

const PROJECT_NAME_REGEX = /^[a-z][a-z0-9-/]+$/;

@injectable()
export class ProjectHelper {
  private projectsCachePath: string;
  private projects: string[];

  public constructor(
    @inject(CommonHelpers) private helpers: CommonHelpers,
    private useCache = false,
  ) {
    this.projectsCachePath = Path.join(this.helpers.rootDir, 'node_modules/.hcli/projects.json');
  }


  /**
   * Only checks given name is in valid format
   * @param name
   * @returns
   */
  public checkName(name: string): R<boolean> {
    if (!PROJECT_NAME_REGEX.test(name)) {
      return ERR(ProjectError.invalidName());
    }

    return OK(true);
  }

  public getCode(project: string, templateRoot: string, context: Record<string, any>): AR<Code> {
    return this.helpers.monorepo.getPackageScope().onOk((packageScope) => {
      context.packageScope = packageScope;
      return this.helpers.getCode({ project, templateRoot, context });
    });
  }

  /**
   * Returns true when module directory exists.
   * @param name
   * @param project
   * @returns
   */
  public isExists(project: string): R<boolean> {
    return this.getProjectPath(project).onOk((modulePath) => this.helpers.fs.pathExists(modulePath));
  }

  public getProjectPath(project: string): R<string> {
    return OK(Path.join(this.helpers.rootDir, project));
  }

  public promptProject(): AR<string> {
    return this.getProjectPromptOptions().onOk((options) => this.helpers.prompt({ project: options }).onOk((r) => r.project));
  }

  public getProjectPromptOptions(): AR<MultiPromptOptions> {
    return this.getProjects().onOk((projects) => {
      return {
        type: 'autocomplete',
        message: 'Select Project',
        initial: 0,
        choices: projects,
      };
    });

  }

  public getProjects(): AR<string[]> {
    if (!this.useCache) {
      return this.helpers.monorepo.getProjects();
    }

    if (!this.helpers.fs.pathExists(this.projectsCachePath)) {
      return this.genProjectCache();
    }

    if (!this.projects) {
      return this.helpers.fs.readJson(this.projectsCachePath).onOk(projects => {
        this.projects = projects;
        return this.projects;
      }) as any;
    }

    return OKA(this.projects);
  }

  private genProjectCache(): AR<string[]> {
    return this.helpers.monorepo.getProjects().onOk((projects) => {
      this.projects = projects;
      if (!this.helpers.fs.pathExists(Path.dirname(this.projectsCachePath))) {
        this.helpers.fs.mkdir(Path.dirname(this.projectsCachePath));
      }

      this.helpers.fs.outputFile({ path: this.projectsCachePath, content: JSON.stringify(this.projects) });
      return this.projects;
    });
  }

  public isMonorepo(): boolean {
    return this.helpers.isMonorepo();
  }
}
