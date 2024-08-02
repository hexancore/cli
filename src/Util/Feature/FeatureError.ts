import { AppError, AppErrorCode, type DefineErrorsUnion } from '@hexancore/common';
import type { ProjectFeatureInfo } from './FeatureHelper';

export const FeatureErrors = {
  invalidName: 'core.cli.feature.invalid_name',
  emptyProject: 'core.cli.feature.empty_project',
  noProjectFeatures: 'core.cli.feature.no_project_features',
  forbiddenInNotMonorepo: 'core.cli.feature.forbidden_in_not_monorepo',
  forbiddenMonorepoModuleInRoot: 'core.cli.feature.forbidden_monorepo_module_in_root',
  notExists: 'core.cli.feature.not_exists',
  exists: 'core.cli.feature.exists',
  noEvents: 'core.cli.feature.domain.no_events'
} as const;

export type FeatureErrors<K extends keyof typeof FeatureErrors, internal extends 'internal' | 'never_internal' = 'internal'> = DefineErrorsUnion<
  typeof FeatureErrors,
  K,
  internal
>;

export class FeatureError {

  public static invalidName(): AppError {
    return new AppError({
      type: FeatureErrors.invalidName,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Feature name must be only letters, digits and starts with upper letter'
    });
  }

  public static emptyProject(): AppError {
    return new AppError({
      type: FeatureErrors.emptyProject,
      code: AppErrorCode.BAD_REQUEST,
      message: 'In monorepo project must be always given'
    });
  }

  public static noProjectFeatures(project: string, projectPath: string): AppError {
    return new AppError({
      type: FeatureErrors.noProjectFeatures,
      code: AppErrorCode.BAD_REQUEST,
      message: 'No project features',
      data: { project, projectPath }
    });

  }

  public static forbiddenInNotMonorepo(): AppError {
    return new AppError({
      type: FeatureErrors.forbiddenInNotMonorepo,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Forbidden in not monorepo project'
    });
  }

  public static forbiddenMonorepoModuleInRoot(): AppError {
    return new AppError({
      type: FeatureErrors.forbiddenMonorepoModuleInRoot,
      code: AppErrorCode.BAD_REQUEST,
      message: 'In monorepo create module in root dir is forbidden'
    });
  }

  public static notExists(path: string): AppError {
    return new AppError({
      type: FeatureErrors.notExists,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Feature not exists in ' + path
    });
  }

  public static exists({ project: project }: ProjectFeatureInfo, path: string): AppError {
    return new AppError({
      type: FeatureErrors.exists,
      code: AppErrorCode.BAD_REQUEST,
      message: `Feature exists in ${project ? project : ''} [${path}]`,
    });
  }

  public static noEvents(): AppError {
    return new AppError({
      type: FeatureErrors.noEvents,
      code: AppErrorCode.BAD_REQUEST,
      message: 'No events in selected feature '
    });
  }
}