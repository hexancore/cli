import { ERR, OK, OKA, type AR, type R } from '@hexancore/common';
import { inject, injectable } from 'inversify';
import * as Path from 'path/posix';
import type { Code } from '../Code/Code';
import { CommonHelpers } from '../CommonHelpers';
import type { MultiPromptOptions } from '../Prompt/EnquirerTypes';
import { ProjectError } from './ProjectError';
import { PromptHelper } from '../Prompt';
import { styles } from '../ConsoleHelper';

const PROJECT_NAME_REGEX = /^[a-z][a-z0-9-/]+$/;

@injectable()
export class ProjectHelper {
  private projectsCachePath: string;
  private projects: string[];
  private projectTypeMessagePrefixes: any;

  public constructor(
    @inject(CommonHelpers) private helpers: CommonHelpers,
    private useCache = false,
  ) {
    this.projectsCachePath = Path.join(this.helpers.rootDir, 'node_modules/.hcli/projects.json');

    this.projectTypeMessagePrefixes = {
      apps: (name) => '🚀 ' + name + styles.hintChoiceText(' (Application)'),
      libs: (name) => '📚 ' + name + styles.hintChoiceText(' (Library)'),
      projects: (name) => '⚙️ ' + name + styles.hintChoiceText(' (Project)')
    };
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
    return this.getProjectPromptOptions().onOk((options) => this.helpers.promptOne<string>(options));
  }

  public promptLib(): AR<string> {
    return this.getProjectPromptOptions({ singleProjectType: 'lib' }).onOk((options) => this.helpers.promptOne<string>(options));
  }

  public promptApp(): AR<string> {
    return this.getProjectPromptOptions({ singleProjectType: 'app' }).onOk((options) => this.helpers.promptOne<string>(options));
  }


  public getProjectPromptOptions(options?: { singleProjectType: 'app' | 'lib'; }): AR<MultiPromptOptions> {
    if (options?.singleProjectType) {
      switch (options.singleProjectType) {
        case 'app': return this.helpers.monorepo.getApps().onOkBind(this.prepareProjectsPrompt, this);
        case 'lib': return this.helpers.monorepo.getApps().onOkBind(this.prepareProjectsPrompt, this);
      }
    }

    return this.helpers.monorepo.getProjects().onOkBind(this.prepareProjectsPrompt, this);
  }

  private prepareProjectsPrompt(projects: string[]) {
    if (projects.length === 0) {
      return ERR(ProjectError.noProjects());
    }

    return PromptHelper.autocomplete({
      message: 'Select Project 📦',
      validate: undefined,
      choices: projects.map((p) => {
        const type = p.substring(0, 4);
        console.log(type);
        const name = p.substring(5).replaceAll('/', '-');
        return { name: p, message: this.projectTypeMessagePrefixes[type](name), value: p };
      })
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
}
