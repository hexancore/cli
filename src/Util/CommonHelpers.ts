import { DI } from '../Constants';
import { inject, injectable, optional } from 'inversify';
import { CodeFactory, type Code, type CreateCodeOptions } from './Code';
import { FilesystemHelper } from './Filesystem';
import { PromptHelper, type MultiPromptOptions } from './Prompt';
import type { AR } from '@hexancore/common';
import { IMonorepoHelper, ProjectHelper } from './Project';
import { FeatureHelper } from './Feature';

@injectable()
export class CommonHelpers {

  public projectHelper: ProjectHelper;
  public featureHelper: FeatureHelper;

  public constructor(
    @inject(DI.rootDir) public rootDir: string,
    @inject(FilesystemHelper) public fs: FilesystemHelper,
    @inject(CodeFactory) private codeFactory: CodeFactory,
    @inject(PromptHelper) private promptHelper: PromptHelper,
    @inject(DI.monorepoHelper) @optional() public monorepo?: IMonorepoHelper,
  ) {
    this.projectHelper = new ProjectHelper(this, false);
    this.featureHelper = new FeatureHelper(this, this.projectHelper);
  }

  public getCode(options: CreateCodeOptions): Code {
    return this.codeFactory.create(options);
  }

  public prompt<QRS extends Record<string, MultiPromptOptions>, RT extends Record<keyof QRS, any>>(questions: QRS): AR<RT> {
    return this.promptHelper.prompt(questions);
  }

  public promptOne<R>(question: MultiPromptOptions): AR<R> {
    return this.promptHelper.promptOne(question);
  }

  public isMonorepo(): boolean {
    return this.monorepo !== undefined;
  }
}