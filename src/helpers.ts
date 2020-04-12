import { Request } from 'express';
import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

import { HTTPMethods, IACLResourcePolicy } from './interfaces';

/**
 * Parse the ACL file
 * @param path File location
 */
export function parseACLFile(path: string): IACLResourcePolicy[] {
  return safeLoad(readFileSync(path, 'utf8'));
}

/**
 * Find role in body
 * @param request Express Request
 */
export function findRole(request: Request): string {
  return (request as any).token.role;
}

/**
 * Check if a request is allowed publicly
 * @param request Express Request
 * @param policy ACL Resource Policy
 */
export function isAllowedPublicly(request: Request, policy: IACLResourcePolicy): boolean {
  if (policy && policy.permissions && policy.permissions.public) {
    return policy.permissions.public === '*'
      || policy.permissions!.public.indexOf(request.method as HTTPMethods) !== -1;
  }
  return false;
}

/**
 * Check if a request is allowed in a certain policy by role
 * @param request Express Request
 * @param role Role
 * @param policy ACL Resource Policy
 */
export function isAllowedInRole(request: Request, role: string, policy: IACLResourcePolicy): boolean {
  if (policy.permissions![role] === undefined) {
    return false;
  } else if (policy.permissions![role] === '*'
    || policy.permissions![role].indexOf(request.method as HTTPMethods) !== -1) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if a hook is set
 * @param hook Hook function
 */
export function isHookSet(hook: any): boolean {
  if (typeof hook === 'function') {
    return true;
  }
  return false;
}
