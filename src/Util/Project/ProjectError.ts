import { AppError, AppErrorCode, type DefineErrorsUnion } from '@hexancore/common';

export const ProjectErrors = {
  invalidName: 'core.cli.project.invalid_name',
  notExists: 'core.cli.project.not_exists',
  exists: 'core.cli.project.exists',
  no_projects: 'core.cli.project.no_projects',
} as const;

export type ProjectErrors<
  K extends keyof typeof ProjectErrors,
  internal extends 'internal' | 'never_internal' = 'internal'
> = DefineErrorsUnion<
  typeof ProjectErrors,
  K,
  internal
>;

export class ProjectError {

  public static invalidName(): AppError {
    return new AppError({
      type: ProjectErrors.invalidName,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Project name must be only lowercase letters, numbers, hyphen and starts with letter'
    });
  }

  public static notExists(path: string): AppError {
    return new AppError({
      type: ProjectErrors.notExists,
      code: AppErrorCode.BAD_REQUEST,
      message: 'Project not exists in ' + path
    });
  }

  public static exists(path: string): AppError {
    return new AppError({
      type: ProjectErrors.exists,
      code: AppErrorCode.BAD_REQUEST,
      message: `Project exists in ${path}`,
    });
  }

  public static noProjects(): AppError {
    return new AppError({
      type: ProjectErrors.no_projects,
      code: AppErrorCode.BAD_REQUEST,
      message: 'No project in current root',
    });
  }
}