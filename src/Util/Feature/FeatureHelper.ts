import { ERR, ERRA, OK, type AR, type R } from '@hexancore/common';
import { type Code } from '../Code';
import { CommonHelpers } from '../CommonHelpers';
import { ProjectHelper } from '../Project';
import type { MultiPromptOptions } from '../Prompt/EnquirerTypes';
import { FeatureError } from './FeatureError';
import path from 'node:path/posix';
import { PromptHelper } from '../Prompt';
import { styles } from '../ConsoleHelper';

const FEATURE_NAME_REGEX = /^[A-Z][a-zA-Z0-9]+$/;

export interface ProjectFeatureInfo {
  project: string,
  feature: string,
}

export interface FeatureEventMeta {
  feature: ProjectFeatureInfo;
  context: string;
  name: string;
}

export class FeatureHelper {
  public constructor(private helpers: CommonHelpers, private projectHelper: ProjectHelper) {

  }

  /**
   * Checks is name and module directory exists
   * @param project
   * @param feature
   * @returns
   */
  public checkExists(project: string, feature: string): R<boolean> {
    return this.checkName(feature)
      .onOk(() => this.isExists(project, feature)
        .onOk(exists => exists ? true : this.getFeaturePath(project, feature)
          .onOk(featurePath => ERR(FeatureError.notExists(featurePath)))
        )
      );
  }

  /**
   * Only checks given name is in valid format
   * @param name
   * @returns
   */
  public checkName(name: string): R<boolean> {
    if (!FEATURE_NAME_REGEX.test(name)) {
      return ERR(FeatureError.invalidName());
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
    return this.getFeaturePath(name, projectPath).onOk((modulePath) => this.helpers.fs.pathExists(modulePath));
  }

  public getCode(projectFeature: ProjectFeatureInfo, templateRoot: string): Code {
    return this.helpers.getCode({
      ...projectFeature,
      templateRoot,
      context: {
        featureName: projectFeature.feature,
        featureImportName: projectFeature.feature
      }
    });
  }

  public getFeaturePath(name: string, project: string): R<string> {
    return this.getProjectPath(project).onOk((projectPath) => path.join(projectPath, 'src', name));
  }

  public getProjectPath(project: string): R<string> {
    return this.projectHelper.getProjectPath(project);
  }

  public promptProject(): AR<string> {
    return this.projectHelper.promptProject();
  }

  public promptProjectAndFeature(): AR<ProjectFeatureInfo> {
    return this.promptProject()
      .onOk(project => this.getProjectFeaturePromptOptions(project)
        .onOk(projectFeaturePrompt => this.helpers.prompt({ feature: projectFeaturePrompt })
          .onOk(projectFeature => ({ project, feature: projectFeature.feature })))
      );
  }

  private getProjectFeaturePromptOptions(project: string): AR<MultiPromptOptions> {
    return this.getFeatures(project).onOk((features) => {
      if (features.length === 0) {
        return ERR(FeatureError.noProjectFeatures(project, this.getProjectPath(project).v));
      }
      return PromptHelper.autocomplete({
        message: styles.warning('Select Feature 🌟'),
        choices: features
      });
    });
  }

  public getFeatures(project: string): AR<string[]> {
    return this.getProjectPath(project).onOk(projectPath => {
      return this.helpers.fs.dirList([projectPath, 'src']);
    });
  }

  public promptFeatureEvent(feature: ProjectFeatureInfo): AR<FeatureEventMeta> {
    return this.getFeatureEvents(feature).onOk((events) => {
      if (events.length === 0) {
        return ERRA(FeatureError.noEvents());
      }

      return this.helpers.promptOne<FeatureEventMeta>(PromptHelper.autocomplete({
        message: styles.warning('Select Event 🕒'),
        choices: events.map((e) => ({ name: e.name, message: styles.hintChoiceText(`[${e.context}] `)+ e.name , value: e })),
        result(value) {
            console.log(value);
            return value;
        },
      }));
    });

  }

  private getFeatureEvents(feature: ProjectFeatureInfo): AR<FeatureEventMeta[]> {
    return this.getFeaturePath(feature.feature, feature.project)
      .onOk(featurePath => {
        const domainPathPrefix = featurePath + '/Domain/';
        return this.helpers.fs.fastGlob(domainPathPrefix + '*/Shared/Event/*', { concurrency: 1 })
          .onOk(paths => paths.map<FeatureEventMeta>(p => {
            const parts = p.substring(domainPathPrefix.length).split('/');
            const context = parts[0];
            const name = parts[3].substring(context.length, parts[3].length-'Event.ts'.length);
            return {
              name,
              context,
              feature,
            };
          })
          );
      });
  }

  public getFeatureApplicationContexts(project: string, feature: string): AR<string[]> {
    return this.getFeaturePath(feature, project)
      .onOk(featurePath => this.helpers.fs.dirList([featurePath, 'Application']));
  }
}
