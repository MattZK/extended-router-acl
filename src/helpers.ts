import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

import { IACLResource } from './interfaces';

export function parseACLFile(path: string): IACLResource[] {
  return safeLoad(readFileSync(path, 'utf8'));
}

export function findRole(request: Request): string {
  return (request as any).token.role;
}
