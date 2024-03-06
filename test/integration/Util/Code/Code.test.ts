import { Code, type CodeOutput } from '@/Util';
import { TestTemplateEngine } from '@/Util/Test';
import TmpDirHelper from '@test/TmpDirHelper';

async function assertCodeRender(code: Code, expected: CodeOutput) {
  const current = (await code.render()).v;
  expect(current).toEqual(expected);
}

describe('Code', () => {
  const rootDir = 'test_root';
  let code: Code;
  const commonTemplateContext = {
    common: 1,
  };

  describe.each([
    ['TestModule', 'module',],
    [null, 'no_module']
  ])('Common: %s %s', (module: string) => {
    beforeEach(() => {
      code = new Code(
        rootDir,
        module,
        'test_template_root',
        commonTemplateContext,
        new TestTemplateEngine(), TmpDirHelper.fs
      );
    });

    test('dir()', async () => {
      code.dir('test_dir');

      assertCodeRender(code, {
        dirs: ['test_root/test_dir'],
        files: []
      });
    });

    test('stringFile()', async () => {
      code.stringFile('test.txt', 'test_content');

      assertCodeRender(code, {
        dirs: [],
        files: [
          { path: 'test_root/test.txt', content: 'test_content' }
        ]
      });
    });

    test('emptyFile()', async () => {
      code.emptyFile('test.txt');

      assertCodeRender(code, {
        dirs: [],
        files: [
          { path: 'test_root/test.txt', content: '' }
        ]
      });
    });

    test('templateFile()', async () => {
      code.templateFile('test.txt', 'out_test.txt', {
        test: 2
      });

      await assertCodeRender(code, {
        dirs: [],
        files: [
          {
            path: 'test_root/out_test.txt',
            content: JSON.stringify({
              template: 'test_template_root/test.txt',
              context: { common: 1, test: 2 }
            })
          }
        ]
      });
    });
  });


  describe('With module', () => {
    beforeEach(() => {
      code = new Code(
        rootDir,
        'TestModule',
        'test_template_root',
        commonTemplateContext,
        new TestTemplateEngine(), TmpDirHelper.fs
      );
    });

    test('srcTemplateFile', async () => {
      code.srcTemplateFile('test.txt', 'out_test.txt', {
        test: 2
      });

      await assertCodeRender(code, {
        dirs: [],
        files: [
          {
            path: 'test_root/src/TestModule/out_test.txt',
            content: JSON.stringify({
              template: 'test_template_root/src/test.txt',
              context: { common: 1, test: 2 }
            })
          }
        ]
      });
    });

    test('testTemplateFile', async () => {
      code.testTemplateFile('unit', 'test.txt', 'out_test.txt', {
        test: 2
      });

      await assertCodeRender(code, {
        dirs: [],
        files: [
          {
            path: 'test_root/test/unit/TestModule/out_test.txt',
            content: JSON.stringify({
              template: 'test_template_root/test/unit/test.txt',
              context: { common: 1, test: 2 }
            })
          }
        ]
      });
    });
  });

});
