import { type AR } from '@hexancore/common';
import { Code, type ProjectFeatureInfo, CommonHelpers, PromptHelper } from '../../../Util';
import { AbstractCodeGenerator } from './AbstractCodeGenerator';

interface EventCreateParams {
  feature: ProjectFeatureInfo;
  name: string;
  context: string;
}

interface FeatureEventGeneratorOptions {
  dryRun?: true;
}

export class FeatureEventGenerator extends AbstractCodeGenerator {
  public constructor(helpers: CommonHelpers) {
    super(helpers);
  }

  public execute(_options: FeatureEventGeneratorOptions): AR<void> {
    return this.prompt().onOk(_params => {

      // TODO: implement
      //params.context = StringHelper.upperFirst(params.context);
      //params.name = StringHelper.upperFirst(params.name);
      //printInfo(`Generating ${params.type.toLowerCase()} '${params.name}' in context '${params.context}' in feature '${params.featureInfo.feature}'`);
      //const code = this.createCode(params);
      //return code.save(options.dryRun);
    });
  }

  private prompt(): AR<EventCreateParams> {
    return this.helpers.featureHelper.promptProjectAndFeature().onOk((feature) => {
      return this.helpers.promptOne<boolean>({type: 'confirm', message: 'Create new ? '}).onOk(createNew => {
        if (createNew) {
          return this.promptCreateParams(feature);
        }
      });
    });

    //.onOk((feature) => this.helpers.featureHelper.promptFeatureEvent(feature));
      //.onOk(featureInfo => this.promptCreateParams(featureInfo));
  }

  private promptCreateParams(feature: ProjectFeatureInfo): AR<EventCreateParams> {
    return this.helpers.featureHelper.getFeatureApplicationContexts(feature.project, feature.feature)
      .onOk(contexts => this.helpers.prompt({
        context: PromptHelper.autocomplete({
          message: 'Context(select or type new)',
          choices: [...contexts]
        }),
        name: PromptHelper.simpleNameInput()
      }))
      .onOk(params => ({ feature, ...params}));
  }

  private createCode(params: EventCreateParams): Code {
    const code = this.helpers.featureHelper.getCode(params.feature, 'Generate/FeatureMessage');
    this.createDirs(code, params);
    this.createFiles(code, params);
    return code;
  }

  private createDirs(code: Code, params: EventCreateParams): void {
    const messageDir = this.getEventDir(params);
    code.dir(`src/${code.feature}/${messageDir}`, false);
  }

  private createFiles(code: Code, params: EventCreateParams): void {
    const messageClassName = params.context + params.name + 'Event';
    const messageHandlerClassName = messageClassName + 'Handler';
    const messagePath = this.getEventDir(params);

    const context = {
      contextName: params.context,
      name: params.name,
      messagePath,
      messageClassName,
      messageHandlerClassName,
    };

    code.srcTemplateFile('Message.ts', `${messagePath}/${messageClassName}.ts`, context);
    code.srcTemplateFile('MessageHandler.ts', `${messagePath}/${messageHandlerClassName}.ts`, context);
    const testHandlerDir = this.getTestEventHandlerDir(params);
    code.testTemplateFile('unit', 'MessageHandler.test.ts', `${testHandlerDir}/${messageHandlerClassName}.test.ts`, context);
  }

  private getEventDir(params: EventCreateParams): string {
    return `Domain/${params.context}/Shared/Event/${params.name}`;
  }

  private getTestEventHandlerDir(params: EventCreateParams): string {
    return `Application/${params.context}/Event/`;
  }
}
