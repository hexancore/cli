import type { interfaces } from 'inversify';
import { CommonHelpers, type Choice } from '../../../Util';
import type { AbstractCodeGenerator } from './AbstractCodeGenerator';
import { FeatureCqrsGenerator } from './FeatureCqrsGenerator';
import { FeatureGenerator } from './FeatureGenerator';

export interface CodeGeneratorChoice {
  choice: Choice<string>;
  generator: AbstractCodeGenerator;
}

export const generatorsContainerBindFactory = (context: interfaces.Context): Map<string, CodeGeneratorChoice> => {
  const commonHelpers = context.container.get(CommonHelpers);
  return new Map([
    ['Command', { choice: { message: '🔤 Command', name: 'Command' }, generator: new FeatureCqrsGenerator(commonHelpers, 'Command') }],
    ['Query', { choice: { message: '❓ Query', name: 'Query' }, generator: new FeatureCqrsGenerator(commonHelpers, 'Query') }],
    //['Event', { choice: { message: '🕒 Event', name: 'Event' }, generator: new FeatureEventGenerator(commonHelpers) }],
    //['Entity', { choice: { message: '💛 Entity', name: 'Entity' }, generator: null }],
    //['DTO', { choice: { message: '💿 DTO', name: 'DTO' }, generator: null }],

    //['Controller', { choice: { message: '🕹️  Controller', name: 'Controller' }, generator: null }],
    //['Service', { choice: { message: '🏛  Service', name: 'Service' }, generator: null }],

    ['Feature', { choice: { message: '🌟 Feature', name: 'Feature' }, generator: new FeatureGenerator(commonHelpers) }],
    //['Application', { choice: { message: '🚀 Application', name: 'Application' }, generator: null }],
    //['Library', { choice: { message: '📚 Library', name: 'Library' }, generator: null }],
  ]);
};