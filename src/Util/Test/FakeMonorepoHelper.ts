import { OKA, type AR } from '@hexancore/common';
import type { IMonorepoHelper } from '../Project';

export class TestMonorepoHelper implements IMonorepoHelper {

  public projects = ['crazy', 'mad', 'insane'];

  public getPackageScope(): AR<string> {
    return OKA('@test_scope');
  }

  public getProjects(): AR<string[]> {
    return OKA(this.projects);
  }

  public isMonorepoRootDir(_dir: string): boolean {
    return true;
  }

}