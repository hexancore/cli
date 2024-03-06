import { type AR } from '@hexancore/common';
import { injectable } from 'inversify';
import type { Code, PromptHelper } from '../../Util';
import { HcModuleHelper, StringHelper, printInfo, type ProjectModuleInfo, styles } from '../../Util';

export declare type MessageType = 'Command' | 'Query' | 'Event';

interface MessageCreateParams {
  type: MessageType;
  name: string;
  group: string;
}

interface MakeModuleMessageCommandOptions {
  dryRun?: true;
}

const MESSAGE_NAME_REGEX = /^[A-Z][a-zA-Z0-9]+$/;

@injectable()
export class MakeModuleMessageCommandHandler {
  public constructor(
    private moduleHelper: HcModuleHelper,
    private promptHelper: PromptHelper,
  ) {
  }

  public execute(options: MakeModuleMessageCommandOptions): AR<void> {
    return this.prompt().onOk(({ projectModule, messageParams }) => {
      messageParams.group = messageParams.group !== '' ? StringHelper.upperFirst(messageParams.group) : '';
      messageParams.name = StringHelper.upperFirst(messageParams.name);
      printInfo(`Making ${messageParams.type} '${messageParams.name}' in group '${messageParams.group}' in module '${projectModule.module}'`);
      const code = this.createCode(projectModule, messageParams);
      return code.save(options.dryRun);
    });
  }

  private prompt(): AR<{ projectModule: ProjectModuleInfo, messageParams: MessageCreateParams }> {
    return this.moduleHelper.promptProjectAndModule()
      .onOk(projectModule => this.promptMessageParams()
        .onOk(messageParams => ({ projectModule, messageParams })));
  }

  private promptMessageParams(): AR<MessageCreateParams> {
    return this.promptHelper.prompt({
      type: {
        type: 'autocomplete',
        message: 'Pick message type',
        initial: 0,
        choices: ['Command', 'Query', 'Event'],
      },
      name: {
        type: 'input',
        message: 'Message name:',
        required: true,
        validate: (input) => {
          const isNameValid = MESSAGE_NAME_REGEX.test(input);
          if (isNameValid) {
            return true;
          }
          return styles.danger('Message name must be only letters, digits and starts with upper letter');
        }
      },
      group: {
        type: 'input',
        message: 'Message Group [Optional]:',
        initial: '',
        required: false,
        validate: (input) => {
          const isNameValid = MESSAGE_NAME_REGEX.test(input);
          if (isNameValid) {
            return true;
          }
          return styles.danger('Group name must be only letters, digits and starts with upper letter');
        }
      },
    });
  }

  private createCode(projectModule: ProjectModuleInfo, params: MessageCreateParams): Code {
    const code = this.moduleHelper.getModuleCode(projectModule, 'MakeModuleMessage');
    this.createDirs(code, params);
    this.createFiles(code, params);
    return code;
  }

  private createDirs(code: Code, params: MessageCreateParams): void {
    if (params.type === 'Event') {
      return;
    }

    const messageDir = this.getMessageDir(params);
    code.dir(`src/${code.module}/${messageDir}`, false);
  }

  private createFiles(code: Code, params: MessageCreateParams): void {
    const messageClassName = params.group + params.name + params.type;
    const messageHandlerClassName = messageClassName + 'Handler';
    const messagePath = this.getMessageDir(params);

    const context = {
      group: params.group,
      name: params.name,
      messageType: params.type,
      messagePath,
      messageClassName,
      messageHandlerClassName,
      nestMessageAnnotation: params.type + 'Handler',
    };

    code.srcTemplateFile('Message.ts', `${messagePath}/${messageClassName}.ts`, context);
    if (params.type !== 'Event') {
      code.srcTemplateFile('MessageHandler.ts', `${messagePath}/${messageHandlerClassName}.ts`, context);
      const testHandlerDir = this.getTestMessageHandlerDir(params);
      code.testTemplateFile('unit', 'MessageHandler.test.ts', `${testHandlerDir}/${messageHandlerClassName}.test.ts`, context);
    }
  }

  private getMessageDir(params: MessageCreateParams): string {
    const groupPrefix = (params.group !== '' ? `${params.group}/` : '');
    const prefix = ((params.type === 'Event') ? 'Domain/Event/' : `Application/${params.type}/`) + groupPrefix;

    return prefix + params.name;
  }

  private getTestMessageHandlerDir(params: MessageCreateParams): string {
    return `Application/${params.type}/` + (params.group !== '' ? `${params.group}/` : '');
  }
}
