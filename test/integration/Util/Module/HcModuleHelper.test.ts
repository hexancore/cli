import { HcModuleError, ProjectHelper } from '@/Util';
import { HcModuleHelper } from '@/Util/Module/HcModuleHelper';
import { TestCommonHelpers } from '@/Util/Test';
import TmpDirHelper from '@test/TmpDirHelper';
import path from 'path/posix';

describe('HcModuleHelper', () => {
  let rootDir: string;
  let commonHelpers: TestCommonHelpers;
  let projectHelper: ProjectHelper;
  let moduleHelper: HcModuleHelper;

  beforeEach(() => {
    rootDir = TmpDirHelper.recreate('HcModuleHelper');
    commonHelpers = new TestCommonHelpers(rootDir);
    projectHelper = new ProjectHelper(commonHelpers, false);
    moduleHelper = new HcModuleHelper(commonHelpers, projectHelper);
  });

  afterEach(() => {
    commonHelpers.checkMockExpections();
  });

  describe('checkExists', () => {
    test('when valid name and directory exists should pass', () => {
      commonHelpers.fs.mkdir(path.join(rootDir, 'libs/someapp/backend/src/TestName'));
      moduleHelper.checkExists('libs/someapp/backend', 'TestName');
    });

    test('when invalid name and directory exists should pass', () => {
      expect(moduleHelper.checkExists('libs/someapp/backend', '^454%TestName')).toMatchAppError(HcModuleError.invalidName());
    });
  });

});