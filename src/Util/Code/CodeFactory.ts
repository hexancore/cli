import { Code } from './Code';
import { inject, injectable } from 'inversify';
import { type ITemplateEngine } from '../TemplateEngine';
import { FilesystemHelper } from '../Filesystem/FilesystemHelper';
import path from 'path/posix';
import { DI } from '../../Constants';


export interface CreateCodeOptions {
  project: string;
  module?: string;
  templateRoot: string;
  context: Record<string, any>;
}

@injectable()
export class CodeFactory {
  public constructor(
    @inject(DI.rootDir) private rootDir: string,
    @inject(DI.templateEngine) private templateEngine: ITemplateEngine,
    private fs: FilesystemHelper
  ) {

  }

  public create(options: CreateCodeOptions): Code {
    const rootDir = options.project === '' ? this.rootDir : path.join(this.rootDir, options.project);
    return new Code(rootDir, options.module, options.templateRoot, options.context, this.templateEngine, this.fs);
  }
}