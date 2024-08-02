import path from 'path/posix';

export const CLI_VERSION = process.env.npm_package_version;
export const CLI_ROOT_DIR = path.dirname(process.argv[1]).replaceAll('\\', '/');

export const DI = {
  rootDir: Symbol('HCLI_ROOT_DIR'),
  monorepoHelper: Symbol('HCLI_MONOREPO_HELPER'),
  templateEngine: Symbol('HCLI_TEMPLATE_ENGINE'),
  generators: Symbol('HCLI_GENERATORS')
};
