import { StdErrors, type AR } from '@hexancore/common';
import type { Command } from '@commander-js/extra-typings';
import type { Container } from 'inversify';
import { printError } from '../ConsoleHelper';
import { AbstractCommandHandler } from './AbstractCommandHandler';

export type CliCommandHandler = AbstractCommandHandler<any> | ((...args: any[]) => AR<void>);

export type CliCommandSetup = (def: Command, container: Container) => CliCommandHandler;
export type SubcommandCliBuilder<N extends string> = CliBuilder;

export class CliBuilder {
  public constructor(private cli: Command, private container: Container) {

  }

  public static create(cli: Command, container: Container): CliBuilder {
    return new this(cli, container);
  }

  public commandGroup<N extends string>(name: N, description?: string): SubcommandCliBuilder<N> {
    const c = this.cli.command(name).description(description ?? `display ${name} subcommands`);
    return new CliBuilder(c as any, this.container);
  }

  public command<N extends string>(name: N, setup: CliCommandSetup): SubcommandCliBuilder<N> {
    const c = this.cli.command(name);
    const handler = setup(c as any, this.container,);
    if (handler instanceof AbstractCommandHandler) {
      c.action(this.createActionHandlerOfCommandHandler(handler));
    } else {
      c.action(this.actionWrapper(handler));
    }
    return new CliBuilder(c as any, this.container);
  }

  private createActionHandlerOfCommandHandler(handler: AbstractCommandHandler<any>): any {
    return this.actionWrapper((args: string[], options: Record<string, any>) => handler.execute(options, args) as any);
  }

  private actionWrapper(action: (args: string[], options: Record<string, any>) => AR<void>): ((...args: any[]) => Promise<void>) {
    return async function () {
      (await action.call(this, this.args, this.opts())).onErr((e) => {
        if (e.type === StdErrors.internal && !e.error) {
          return;
        }

        printError(JSON.stringify(e.getLogRecord(), undefined, 2));
      });
    };

  }
}