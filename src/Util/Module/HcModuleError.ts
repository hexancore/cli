import { AppError, AppErrorCode, type DefineErrorsUnion } from '@hexancore/common';
import type { ProjectModuleInfo } from './HcModuleHelper';

export const HcModuleErrors = {
  invalidName: 'core.cli.hc_module.invalid_name',
  emptyProject: 'core.cli.hc_module.empty_project',
  noProjectModules: 'core.cli.hc_module.no_project_modules',
  forbiddenInNotMonorepo: 'core.cli.hc_module.forbidden_In_not_monorepo',
  forbiddenMonorepoModuleInRoot: 'core.cli.hc_module.forbidden_monorepo_module_in_root',
  notExists: 'core.cli.hc_module.not_exists',
  exists: 'core.cli.hc_module.exists'
} as const;

export type HcModuleErrors<K extends keyof typeof HcModuleErrors, internal extends 'internal' | 'never_internal' = 'internal'> = DefineErrorsUnion<
  typeof HcModuleErrors,
  K,
  internal
>;

export class HcModuleError {

  public static invalidName(): AppError {
    return new AppError({
      type: HcModuleErrors.invalidName,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Module name must be only letters, digits and starts with upper letter'
    });
  }

  public static emptyProject(): AppError {
    return new AppError({
      type: HcModuleErrors.emptyProject,
      code: AppErrorCode.BAD_REQUEST,
      message: 'In monorepo project must be always given'
    });
  }

  public static noProjectModules(project: string, projectPath: string): AppError {
    return new AppError({
      type: HcModuleErrors.noProjectModules,
      code: AppErrorCode.BAD_REQUEST,
      message: 'No project modules',
      data: { project, projectPath }
    });

  }

  public static forbiddenInNotMonorepo(): AppError {
    return new AppError({
      type: HcModuleErrors.forbiddenInNotMonorepo,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Forbidden in not monorepo project'
    });
  }

  public static forbiddenMonorepoModuleInRoot(): AppError {
    return new AppError({
      type: HcModuleErrors.forbiddenMonorepoModuleInRoot,
      code: AppErrorCode.BAD_REQUEST,
      message: 'In monorepo create module in root dir is forbidden'
    });
  }

  public static notExists(path: string): AppError {
    return new AppError({
      type: HcModuleErrors.notExists,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Module not exists in ' + path
    });
  }

  public static exists({ project: project }: ProjectModuleInfo, path: string): AppError {
    return new AppError({
      type: HcModuleErrors.exists,
      code: AppErrorCode.BAD_REQUEST,
      message: `Module exists in ${project ? project : ''} [${path}]`,
    });
  }
}