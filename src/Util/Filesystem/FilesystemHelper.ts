import * as fs from 'fs-extra';
import { injectable } from 'inversify';
import type { FileItem } from './FileItem';
import { glob, type Options } from 'fast-glob';
import { ARW, type AR, ERR } from '@hexancore/common';

@injectable()
export class FilesystemHelper {

  public pathExists(path: string): boolean {
    return fs.pathExistsSync(path);
  }

  public mkdirs(dirs: string[]): AR<void> {
    return ARW(Promise.all(dirs.map((file: string) => this.mkdir(file).p))).onOk((results) => {
      const errors = results.filter((r) => r.isError());
      if (errors.length > 0) {
        return ERR('core.cli.fs.mkdirs', 500, errors);
      }
    });
  }

  public mkdir(dir: string): AR<void> {
    const mode = 0o2775;
    return ARW(fs.ensureDir(dir, mode));
  }

  public outputFiles(files: FileItem[]): AR<void> {
    return ARW(Promise.all(files.map((file: FileItem) => this.outputFile(file).p))).onOk((results) => {
      const errors = results.filter((r) => r.isError());
      if (errors.length > 0) {
        return ERR('core.cli.fs.output_files', 500, errors);
      }
    });
  }

  public outputFile(path: FileItem | string, content?: string | (() => AR<string>)): AR<void> {
    const file = typeof path === 'object' ? path : { path, content };
    return ARW(fs.outputFile(file.path, file.content));
  }

  public readTextFile(path: string, encoding: BufferEncoding = 'utf8'): AR<string> {
    return ARW(fs.readFile(path)).onOk((buffer) => {
      return buffer.toString(encoding);
    });
  }

  public readJson<T = any>(path: string): AR<T> {
    return this.readTextFile(path).onOk(content => JSON.parse(content));
  }

  public getFileLines(path: string): AR<string[]> {
    return this.readTextFile(path).onOk((text) => text.split('\n'));
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
