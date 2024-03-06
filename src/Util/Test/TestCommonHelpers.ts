import { mock, type M } from '@hexancore/mocker';
import { CommonHelpers } from '../CommonHelpers';
import { FilesystemHelper } from '../Filesystem';
import type { MultiPromptOptions, PromptHelper } from '../Prompt';
import { TestMonorepoHelper } from './FakeMonorepoHelper';
import { OKA } from '@hexancore/common/lib/mjs';
import { TestTemplateEngine } from './FakeTemplateEngine';
import { CodeFactory } from '../Code';

export class TestCommonHelpers extends CommonHelpers {

  private promptHelperMock: M<PromptHelper>;

  public constructor(rootDir: string) {
    const fs = new FilesystemHelper;
    const codeFactory = new CodeFactory(rootDir, new TestTemplateEngine(), fs);
    const promptHelper = mock<PromptHelper>();
    super(rootDir, fs, codeFactory, promptHelper.i, new TestMonorepoHelper);

    this.promptHelperMock = promptHelper;
  }

  public expectsPrompt<QRS extends Record<string, MultiPromptOptions>, RT extends Record<keyof QRS, any>>(questions: QRS, answers: RT): void {
    this.promptHelperMock.expects('prompt', expect.objectContaining(questions)).andReturn(OKA(answers));
  }

  public checkMockExpections(): void {
    this.promptHelperMock.checkExpections();
  }
}