import { AbstractCommandHandler, type FileItem } from '../../Util';
import { AsyncResult, ERR, OK, OKA, type AR, type R } from '@hexancore/common';
import { LocalDate, ZoneOffset } from '@js-joda/core';
import { injectable } from 'inversify';
import { Changelog } from '../../Util/Changelog/Changelog';

interface PackageBumpVersionCommandOptions {
  dryRun?: true;
  releaseDate?: string;
}

@injectable()
export class PackageBumpVersionCommandHandler extends AbstractCommandHandler<PackageBumpVersionCommandOptions> {
  public execute(options: PackageBumpVersionCommandOptions, newVersion: string): AR<void> {
    return this.helpers.fs.readJson('package.json').onOk(packageJson => {
      packageJson.version = newVersion;
      const repositoryUrl = this.extractReposiotryUrlFromPackageJson(packageJson);
      if (repositoryUrl.isError()) {
        return ERR(repositoryUrl.e);
      }
      const releaseDate: string = options.releaseDate ?? LocalDate.now(ZoneOffset.UTC).toString();

      const updatedChangelog = this.updateChangelog(repositoryUrl.v, newVersion, releaseDate);
      return this.save([
        { path: 'package.json', content: JSON.stringify(packageJson, null, 2) + '\n' },
        { path: 'CHANGELOG.md', content: updatedChangelog },
      ], options.dryRun);
    }).onOk(() => true as any);
  }

  private extractReposiotryUrlFromPackageJson(packageJson: Record<string, any>): R<string> {
    const repositoryUrl = packageJson.repository?.url;
    if (typeof repositoryUrl !== 'string') {
      return ERR('core.cli.package.empty_repository_url');
    }
    return OK(repositoryUrl.replace('.git', '').replace('git+', ''));
  }

  private updateChangelog(repositoryUrl: string, newVersion: string, releaseDate): AR<string> {
    return this.helpers.fs.getFileLines('CHANGELOG.md').onOk((lines) => {
      const changelog = new Changelog(repositoryUrl, lines);
      changelog.updateWithNewVersion(newVersion, releaseDate);
      return changelog.toString();
    });
  }

  private save(files: FileItem[], dryRun: boolean): AR<void> {
    if (dryRun) {
      console.log('Files:\n');
      return OKA(files).onEachAsArray((item) => {
        if (typeof item.content === 'string') {
          console.log(`### ${item.path} ###\n${item.content}\n### END ###\n\n`);
          return OK(true) as any;
        }

        const content: AsyncResult<string> = (item.content instanceof AsyncResult) ? item.content : item.content();
        return content.onOk(content => {
          console.log(`### ${item.path} ###\n${content}\n### END ###\n\n`);
          return OK(true) as any;
        });

      }).onOk(() => OK(true) as any);
    }

    return this.helpers.fs.outputFiles(files).onOk(() => OK(true) as any);
  }
}