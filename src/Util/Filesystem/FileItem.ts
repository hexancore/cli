import type { AR } from '@hexancore/common';

export interface FileItem {
  readonly path: string;
  readonly content: string | (() => AR<string>) | AR<string>;
}
