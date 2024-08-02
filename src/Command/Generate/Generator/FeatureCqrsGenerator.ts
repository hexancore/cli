import { type AR } from '@hexancore/common';
import { Code, StringHelper, printInfo, type ProjectFeatureInfo, CommonHelpers, PromptHelper } from '../../../Util';
import { AbstractCodeGenerator } from './AbstractCodeGenerator';

export declare type MessageType = 'Command' | 'Query' | 'Event';

interface MessageCreateParams {
  type: MessageType;
  featureInfo: ProjectFeatureInfo;
  name: string;
  context: string;

}

interface FeatureMessageGeneratorOptions {
  dryRun?: true;
}

export class FeatureCqrsGenerator extends AbstractCodeGenerator {
  public constructor(helpers: CommonHelpers, private messageType: MessageType) {
    super(helpers);
  }

  public execute(options: FeatureMessageGeneratorOptions): AR<void> {
    return this.prompt().onOk(params => {
      params.context = StringHelper.upperFirst(params.context);
      params.name = StringHelper.upperFirst(params.name);
      printInfo(`Generating ${params.type.toLowerCase()} '${params.name}' in context '${params.context}' in feature '${params.featureInfo.feature}'`);
      const code = this.createCode(params);
      return code.save(options.dryRun);
    });
  }

  private prompt(): AR<MessageCreateParams> {
    return this.helpers.featureHelper.promptProjectAndFeature().onOk(featureInfo => this.promptMessageParams(featureInfo));
  }

  private promptMessageParams(featureInfo: ProjectFeatureInfo): AR<MessageCreateParams> {
    return this.helpers.featureHelper.getFeatureApplicationContexts(featureInfo.project, featureInfo.feature)
      .onOk(contexts => this.helpers.prompt({
        context: PromptHelper.autocomplete({
          message: 'Context(select or type new)',
          choices: [...contexts]
        }),
        name: PromptHelper.simpleNameInput()
      }))
      .onOk(params => ({ type: this.messageType, featureInfo: featureInfo, ...params }));
  }

  private createCode(params: MessageCreateParams): Code {
    const code = this.helpers.featureHelper.getCode(params.featureInfo, 'Generate/FeatureMessage');
    this.createDirs(code, params);
    this.createFiles(code, params);
    return code;
  }

  private createDirs(code: Code, params: MessageCreateParams): void {
    if (params.type === 'Event') {
      return;
    }

    const messageDir = this.getMessageDir(params);
    code.dir(`src/${code.feature}/${messageDir}`, false);
  }

  private createFiles(code: Code, params: MessageCreateParams): void {
    const messageClassName = params.context + params.name + params.type;
    const messageHandlerClassName = messageClassName + 'Handler';
    const messagePath = this.getMessageDir(params);

    const context = {
      contextName: params.context,
      name: params.name,
      messageType: params.type,
      messagePath,
      messageClassName,
      messageHandlerClassName,
    };

    code.srcTemplateFile('Message.ts', `${messagePath}/${messageClassName}.ts`, context);
    if (params.type !== 'Event') {
      code.srcTemplateFile('MessageHandler.ts', `${messagePath}/${messageHandlerClassName}.ts`, context);
      const testHandlerDir = this.getTestMessageHandlerDir(params);
      code.testTemplateFile('unit', 'MessageHandler.test.ts', `${testHandlerDir}/${messageHandlerClassName}.test.ts`, context);
    }
  }

  private getMessageDir(params: MessageCreateParams): string {
    return `Application/${params.context}/${params.type}/${params.name}`;

  }

  private getTestMessageHandlerDir(params: MessageCreateParams): string {
    return `Application/${params.context}/${params.type}/`;
  }
}
