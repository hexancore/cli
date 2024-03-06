import * as fs from 'fs-extra';
import { injectable } from 'inversify';
import type { FileItem } from './FileItem';
import { glob, type Options } from 'fast-glob';
import { ARW, type AR } from '@hexancore/common';

@injectable()
export class FilesystemHelper {
  
  public pathExists(path: string): boolean {
    return fs.pathExistsSync(path);
  }

  public async mkdirs(dirs: string[]): Promise<void> {
    await Promise.all(dirs.map((file: string) => this.mkdir(file)));
  }

  public async mkdir(dir: string): Promise<void> {
    const mode = 0o2775;
    await fs.ensureDir(dir, mode);
  }

  public async outputFiles(files: FileItem[]): Promise<void> {
    await Promise.all(files.map((file: FileItem) => this.outputFile(file)));
  }

  public async outputFile(file: FileItem): Promise<void> {
    return fs.outputFile(file.path, file.content);
  }

  public async readFile(path: string): Promise<string> {
    const buffer = await fs.readFile(path);
    return buffer.toString('utf8');
  }

  public readJson<T = any>(path: string): AR<T> {
    return ARW(this.readFile(path)).onOk(content => JSON.parse(content));
  }

  public fastGlob(patterns: string | string[], options: Options): AR<string[]> {
    options = {
      braceExpansion: false,
      extglob: false,
      concurrency: 2,
      followSymbolicLinks: false,
      stats: false,
      ...options
    };
    return ARW(glob(patterns, options));
  }
}
