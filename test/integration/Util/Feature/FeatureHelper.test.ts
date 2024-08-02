import { FeatureError, ProjectHelper } from '@/Util';
import { FeatureHelper } from '@/Util/Feature/FeatureHelper';
import { TestCommonHelpers } from '@/Util/Test';
import TmpDirHelper from '@test/TmpDirHelper';
import path from 'path/posix';

describe('HcModuleHelper', () => {
  let rootDir: string;
  let commonHelpers: TestCommonHelpers;
  let projectHelper: ProjectHelper;
  let featureHelper: FeatureHelper;

  beforeEach(() => {
    rootDir = TmpDirHelper.recreate('FeatureHelper');
    commonHelpers = new TestCommonHelpers(rootDir);
    projectHelper = new ProjectHelper(commonHelpers, false);
    featureHelper = new FeatureHelper(commonHelpers, projectHelper);
  });

  afterEach(() => {
    commonHelpers.checkMockExpections();
  });

  describe('checkExists', () => {
    test('when valid name and directory exists should pass', () => {
      commonHelpers.fs.mkdir(path.join(rootDir, 'libs/someapp/backend/src/TestName'));
      featureHelper.checkExists('libs/someapp/backend', 'TestName');
    });

    test('when invalid name and directory exists should pass', () => {
      expect(featureHelper.checkExists('libs/someapp/backend', '^454%TestName')).toMatchAppError(FeatureError.invalidName());
    });
  });

});