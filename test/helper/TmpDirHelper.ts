import { FilesystemHelper } from '@/Util';
import { LogicError } from '@hexancore/common';
import { mkdirSync, rmSync } from 'fs-extra';
import path from 'path/posix';

const TmpDirHelper = {
  recreate(dir: string): string {
    const rootTmpDir = process.env['TEST_TMP_DIR'];

    if (!dir || dir.length === 0 || !rootTmpDir || !rootTmpDir.endsWith('tmp') || rootTmpDir.length <= 8) {
      throw new LogicError('Empty tmp dir path');
    }

    dir = path.join(process.env['TEST_TMP_DIR'], dir);
    rmSync(dir, { force: true, recursive: true });
    mkdirSync(dir, { recursive: true });
    return dir;
  },
  fs: new FilesystemHelper()
};

export default TmpDirHelper;