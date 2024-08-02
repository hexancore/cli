import type { AppError } from '@hexancore/common';
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
  selected: (text: string) => string;
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
  warning: chalk.yellow,
  selected: (text: string): string => chalk.blue.bold.underline(text),
  selectHighlight: (text: string): string => chalk.yellow.bold.underline(text),
  selectPointer: chalk.yellow('→'),
  hintChoiceText: (text: string): string => chalk.italic.yellow(text),
};

export function printInfo(message: string): void {
  console.log(styles.info(message));
}

export function printError(message: string | AppError): void {
  if (typeof message !== 'string') {
    message = JSON.stringify(message.getLogRecord(), null, 2);
  }

  console.error(styles.danger(message));
}



