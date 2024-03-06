import { ARW, type AR, OKA } from '@hexancore/common';
import * as Path from 'path/posix';
import type { FileItem } from '../Filesystem/FileItem';
import type { FilesystemHelper } from '../Filesystem/FilesystemHelper';
import type { ITemplateEngine } from '../TemplateEngine';

export declare type TestType = 'unit' | 'integration' | 'functional' | 'e2e';

export interface CodeOutput {
  dirs: string[];
  files: FileItem[];
}

/**
 * Represents project or module code dirs and files to create.
 */
export class Code {
  protected dirs: string[];
  protected files: FileItem[];

  public constructor(
    public readonly rootDir: string,
    public readonly module: string | null,
    protected templateRoot: string,
    protected context: Record<string, any>,
    protected templateEngine: ITemplateEngine,
    protected fs: FilesystemHelper,
  ) {
    this.dirs = [];
    this.files = [];
  }

  public get moduleClassPrefix(): string {
    return this.module;
  }

  public dir(path: string, addGitKeep = false): this {
    this.dirs.push(Path.join(this.rootDir, path));
    if (addGitKeep) {
      this.emptyFile(Path.join(path, '.gitkeep'));
    }
    return this;
  }

  public srcTemplateFile(templateFilePath: string, outFilePath: string, context?: Record<string, any>): this {
    templateFilePath = Path.join('src', templateFilePath);
    return this.templateFile(templateFilePath, this.getSrcPath(outFilePath), context);
  }

  public srcEmptyFile(filePath: string): this {
    return this.emptyFile(this.getSrcPath(filePath));
  }

  public testTemplateFile(testType: TestType, templateFilePath: string, outFilePath: string, context?: Record<string, any>): this {
    return this.templateFile(Path.join('test', testType, templateFilePath), this.getTestPath(testType, outFilePath), context);
  }

  /**
   * Appends file with content rendered from template
   * @param templateFilePath
   * @param outFilePathOrContext
   * @param context Context to render
   * @returns
   */
  public templateFile(templateFilePath: string, outFilePathOrContext?: string | Record<string, any>, context?: Record<string, any>): this {
    if (typeof outFilePathOrContext === 'object' || typeof outFilePathOrContext === 'undefined') {
      context = outFilePathOrContext;
      outFilePathOrContext = templateFilePath;
    }
    context = context ?? {};
    context = { ...this.context, ...context };

    templateFilePath = Path.join(this.templateRoot, templateFilePath);

    const content = () => this.templateEngine.renderAsync(templateFilePath, context);
    return this.stringFile(outFilePathOrContext, content);
  }

  public stringFile(filePath: string, content: string | (() => AR<string>)): this {
    this.files.push({
      path: Path.join(this.rootDir, filePath),
      content: content,
    });

    return this;
  }

  public emptyFile(path: string): this {
    this.stringFile(path, '');
    return this;
  }

  protected getSrcPath(path: string): string {
    return this.getPath('src', path);
  }

  protected getTestPath(testType: TestType, path: string): string {
    const prefix = Path.join('test', testType);
    return this.getPath(prefix, path);
  }

  protected getPath(prefix: string, path: string): string {
    return this.isModule() ? Path.join(prefix, this.module, path) : Path.join(prefix, path);
  }

  public isModule(): boolean {
    return this.module !== null;
  }

  public print(): AR<void> {
    return this.render().onOk((output) => {
      console.log('Dirs:\n' + output.dirs.join('\n'));
      console.log('Files:\n' + output.files.map((f) => `### ${f.path} ###\n${f.content}\n### END ###\n`).join('\n'));
    });
  }

  public save(dryRun = false): AR<void> {
    if (dryRun) {
      return this.print();
    }

    return this.render().onOk((output) => {
      return ARW(this.fs.mkdirs(output.dirs))
        .onOk(() => {
          this.fs.outputFiles(output.files);
        });
    });
  }

  public render(): AR<CodeOutput> {
    const promises = this.files.map(async (f) => {
      return { path: f.path, content: typeof f.content === 'function' ? (await f.content()).v : f.content };
    });
    return ARW(Promise.all(promises)).onOk((files) => {
      this.files = files;
      return {
        dirs: this.dirs,
        files: files,
      };
    });
  }
}
