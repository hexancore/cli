import { ERR, OK, OKA, type AR, type R } from '@hexancore/common';
import { LocalDate, ZoneOffset } from '@js-joda/core';
import { inject, injectable } from 'inversify';
import { FilesystemHelper, type FileItem } from '../../Util';
import { Changelog } from '../../Util/Changelog/Changelog';

interface PackageBumpVersionCommandOptions {
  dryRun?: true;
  newVersion: string;
  releaseDate?: string
}

@injectable()
export class PackageBumpVersionCommandHandler {
  public constructor(
    @inject(FilesystemHelper) private fs: FilesystemHelper
  ) {
  }

  public execute(options: PackageBumpVersionCommandOptions): AR<void> {
    return this.fs.readJson('package.json').onOk(packageJson => {
      packageJson.version = options.newVersion;
      const repositoryUrl = this.extractReposiotryUrlFromPackageJson(packageJson);
      if (repositoryUrl.isError()) {
        return ERR(repositoryUrl.e);
      }
      const releaseDate: string = options.releaseDate ?? LocalDate.now(ZoneOffset.UTC).toString();

      const updatedChangelog = this.updateChangelog(repositoryUrl.v, options.newVersion, releaseDate);
      return this.save([
        { path: 'package.json', content: JSON.stringify(packageJson, null, 2) },
        { path: 'CHANGELOG.md', content: () => updatedChangelog },
      ], options.dryRun);
    });
  }

  private extractReposiotryUrlFromPackageJson(packageJson: Record<string, any>): R<string> {
    const repositoryUrl = packageJson.repository?.url;
    if (typeof repositoryUrl !== 'string') {
      return ERR('core.cli.package.empty_repository_url');
    }
    return OK(repositoryUrl.replace('.git', ''));
  }

  private updateChangelog(repositoryUrl: string, newVersion: string, releaseDate): AR<string> {
    return this.fs.getFileLines('CHANGELOG.md').onOk((lines) => {
      const changelog = new Changelog(repositoryUrl, lines);
      changelog.updateWithNewVersion(newVersion, releaseDate);
      return changelog.toString();
    });
  }

  private save(files: FileItem[], dryRun: boolean): AR<void> {
    if (dryRun) {
      return OKA(files).onEachAsArray((item) => {
        if (typeof item.content === 'function') {
          return item.content().onOk((content) => {
            console.log('Files:\n' + `### ${item.path} ###\n${content}\n### END ###\n\n`);
          });
        } else {
          console.log('Files:\n' + `### ${item.path} ###\n${item.content}\n### END ###\n\n`);
          return OK(undefined);
        }

      }).onOk(() => { });
    }

    return this.fs.outputFiles(files);
  }
}