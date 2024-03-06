import { inject, injectable } from 'inversify';
import { existsSync } from 'fs-extra';
import path from 'path/posix';
import type { IMonorepoHelper } from '../Project/IMonorepoHelper';
import { DI } from '@/Constants';
import { OKA, type AR } from '@hexancore/common';
import { FilesystemHelper } from '../Filesystem/FilesystemHelper';

@injectable()
export class NxHelper implements IMonorepoHelper {
  private projects: string[];
  public constructor(
    @inject(DI.rootDir) private rootDir: string,
    private fs: FilesystemHelper,
  ) {

  }

  public getPackageScope(): AR<string> {
    return this.fs.readJson(path.join(this.rootDir, 'package.json')).onOk((data: { name: string }) => {
      return data.name.split('/')[0];
    });
  }

  public getProjects(): AR<string[]> {
    if (!this.projects) {
      return this.fs.fastGlob([
        'projects/**/package.json',
        'apps/**/package.json',
        'libs/**/package.json',
      ], {
        deep: 3,
        cwd: this.rootDir,
        onlyFiles: true,
        concurrency: 2,
      }).onOk((projects) => {
        this.projects = projects.map((p) => p.substring(0, p.lastIndexOf('/'))).sort();
        return this.projects;
      });
    }
    return OKA(this.projects);
  }

  public isMonorepoRootDir(dir: string): boolean {
    return this.isNxMonorepo(dir);
  }

  public isNxMonorepo(rootDir: string): boolean {
    return existsSync(path.join(rootDir, 'nx.json'));
  }
}