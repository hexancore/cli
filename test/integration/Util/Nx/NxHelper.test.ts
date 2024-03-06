import { NxHelper } from '@/Util/Nx/NxHelper';
import TmpDirHelper from '@test/TmpDirHelper';
import { writeFileSync } from 'fs-extra';
import path from 'path/posix';

describe('PromptHelper', () => {
  let rootDir;
  let helper: NxHelper;
  beforeEach(() => {
    rootDir = TmpDirHelper.recreate('NxHelper');
    helper = new NxHelper(rootDir, TmpDirHelper.fs);
    writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify({
      name: '@test_scope/test_package',
    }));
  });

  describe('getPackageScope', () => {
    test('when package.json exists', async () => {
      const current = await helper.getPackageScope();

      expect(current).toMatchSuccessResult('@test_scope');
    });
  });
});

