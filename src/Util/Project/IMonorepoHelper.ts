import type { AR } from '@hexancore/common';

export interface IMonorepoHelper {
  getPackageScope(): AR<string>;
  getProjects(): AR<string[]>;
  isMonorepoRootDir(dir: string): boolean;
}