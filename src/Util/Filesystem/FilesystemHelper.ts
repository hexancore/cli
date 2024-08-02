import * as fs from 'fs-extra';
import { injectable } from 'inversify';
import type { FileItem } from './FileItem';
import { glob, type Options } from 'fast-glob';
import { ARW, type AR, ERR, OK } from '@hexancore/common';
import path from 'node:path/posix';


const DIR_LIST_GLOB_OPTS = { deep: 1, onlyDirectories: true };

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

      return OK(true) as any;
    });
  }

  public outputFile(path: FileItem | string, content?: FileItem['content']): AR<void> {
    let file = typeof path === 'object' ? path : { path, content };
    if (typeof file.content === 'string') {
      return ARW(fs.outputFile(file.path, file.content));
    }

    if (typeof file.content === 'function') {
      file = { path: file.path, content: file.content() };
    }

    return (file.content as AR<string>).onOk(content => ARW(fs.outputFile(file.path, content)));

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
    return ARW(glob(patterns, options)).onOk((paths) => paths.map(p => p.replaceAll('\\', '/')));
  }

  public dirList(dir: string | string[], fullPaths?: boolean): AR<string[]> {
    dir = Array.isArray(dir) ? path.join(...dir) : dir;
    return this.fastGlob(dir + '/*', DIR_LIST_GLOB_OPTS)
      .onOk((dirs) => {
        dirs = fullPaths ? dirs : dirs.map(p => path.basename(p));
        return dirs.sort(); // NOSONAR;
      });
  }
}
