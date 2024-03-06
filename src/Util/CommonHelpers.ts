import { DI } from '../Constants';
import { inject, injectable } from 'inversify';
import { CodeFactory, type Code, type CreateCodeOptions } from './Code';
import { FilesystemHelper } from './Filesystem';
import { PromptHelper, type MultiPromptOptions } from './Prompt';
import type { AR } from '@hexancore/common/lib/mjs';
import type { IMonorepoHelper } from './Project';

@injectable()
export class CommonHelpers {
  public constructor(
    @inject(DI.rootDir) public readonly rootDir: string,
    @inject(FilesystemHelper) public readonly fs: FilesystemHelper,
    @inject(CodeFactory) private codeFactory: CodeFactory,
    @inject(PromptHelper) private promptHelper: PromptHelper,
    @inject(DI.monorepoHelper) public readonly monorepo?: IMonorepoHelper,
  ) {

  }

  public getCode(options: CreateCodeOptions): Code {
    return this.codeFactory.create(options);
  }

  public prompt<QRS extends Record<string, MultiPromptOptions>, RT extends Record<keyof QRS, any>>(questions: QRS): AR<RT> {
    return this.promptHelper.prompt(questions);
  }

  public isMonorepo(): boolean {
    return this.monorepo !== null;
  }
}