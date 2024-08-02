import type { AR } from '@hexancore/common';

export interface IMonorepoHelper {
  getPackageScope(): AR<string>;
  getApps(): AR<string[]>;
  getLibs(): AR<string[]>;
  getProjects(): AR<string[]>;
  isMonorepoRootDir(dir: string): boolean;
}