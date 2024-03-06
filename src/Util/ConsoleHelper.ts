import chalk from 'chalk';

export interface ConsoleTheme {
  danger: chalk.Chalk;
  dark: chalk.Chalk;
  disabled: chalk.Chalk;
  em: chalk.Chalk;
  heading: chalk.Chalk;
  info: chalk.Chalk;
  muted: chalk.Chalk;
  primary: chalk.Chalk;
  strong: chalk.Chalk;
  success: chalk.Chalk;
  underline: chalk.Chalk;
  warning: chalk.Chalk;
}

export const styles = {
  danger: chalk.red,
  dark: chalk.dim.gray,
  disabled: chalk.gray,
  em: chalk.italic,
  heading: chalk.bold.underline,
  info: chalk.cyan,
  muted: chalk.dim,
  primary: chalk.blue,
  strong: chalk.bold,
  success: chalk.green,
  underline: chalk.underline,
  warning: chalk.yellow
};


export function printInfo(message: string): void {
  console.log(styles.info(message));
}

export function printError(message: string): void {
  console.log(styles.danger(message));
}

