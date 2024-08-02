
export class Changelog {

  public constructor(
    public readonly repositoryUrl: string,
    public lines: string[]
  ) {

  }

  protected genCompareRevLink(oldRev: string | null, newRev: string | 'HEAD'): string {
    const label = newRev === 'HEAD' ? '[unreleased]' : `[${newRev}]`;
    const linkType = oldRev === null ? `/releases/tag/${newRev}` : `compare/${oldRev}...${newRev}`;
    return `${label} ${this.repositoryUrl}/${linkType}   `;
  }

  public updateWithNewVersion(newVersion: string, releaseDate: string): void {
    const newVersionChangesReplaces = [
      '## [Unreleased]\n',
      `## [${newVersion}] - ${releaseDate}`,
    ].join('\n');

    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i] === '## [Unreleased]') {
        this.lines[i] = newVersionChangesReplaces;
        break;
      }
    }

    this.updateFooter(newVersion);
  }

  private updateFooter(newVersion: string): void {
    let foundOldVersion = false;
    for (let i = this.lines.length - 1; i >= 0; i--) {
      if (this.lines[i].startsWith('[unreleased]')) {
        if (this.lines.length < i + 1) {
          throw new Error('`[unreleased]` line exists, but previous version line not'
          );
        }

        const extractOldVersionRegex = /\[([0-9.]+)\]/;
        // [0.1.0] ...
        const oldVersionTagString = this.lines[i + 1].split(' ', 1)[0];
        const oldVersionMatch = oldVersionTagString.match(extractOldVersionRegex);

        if (!oldVersionMatch) {
          throw new Error('Invalid old version format: ' + oldVersionTagString);
        }

        const oldVersion = oldVersionMatch[1];

        this.lines[i] = [
          this.genCompareRevLink(newVersion, 'HEAD'),
          this.genCompareRevLink(oldVersion, newVersion),
        ].join('\n');
        foundOldVersion = true;
        break;
      }
    }

    if (!foundOldVersion) {
      this.lines.push(
        [
          this.genCompareRevLink(newVersion, 'HEAD'),
          this.genCompareRevLink(null, newVersion),
        ].join('\n')
      );
    }
  }

  public toString(): string {
    return this.lines.join('\n');
  }
}