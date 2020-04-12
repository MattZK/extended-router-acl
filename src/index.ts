import { NextFunction, Request, Response } from 'express';
import minimatch from 'minimatch';

import { findRole, isAllowedInRole, isAllowedPublicly, isHookSet, parseACLFile } from './helpers';
import { ConfigOptions, Errors, IACLResourcePolicy } from './interfaces';

let rules: IACLResourcePolicy[];
let options: ConfigOptions;

/**
 * Configuration
 * @param values ACL Configuration Options
 */
export function config(values: ConfigOptions) {
  rules = parseACLFile(values.file!);
  options = values;
}

/**
 * Middleware function
 * @param request Express Request
 * @param response Express Response
 * @param next Express NextFunction
 */
export async function authorize(request: Request, response: Response, next: NextFunction) {
  checkPolicy(request, response).then(() => {
    succeed(request, response, next);
  }).catch((error: Errors) => {
    fail(request, response, error);
  });
}

function checkPolicy(request: Request, response: Response): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const resourcePolicy = rules.find((rule) => minimatch(request.path, rule.resource));

    if (!resourcePolicy) { return reject(Errors.NoResourcePolicy); }
    if (!resourcePolicy.permissions) { return reject(Errors.NoResourcePermissions); }

    if (isAllowedPublicly(request, resourcePolicy)) {
      return resolve();
    }

    if (isHookSet(options.preAuthorize)) {
      await options.preAuthorize!(request, response);
    }

    const role = findRole(request as any);

    if (isAllowedInRole(request, role, resourcePolicy)) {
      return resolve();
    } else {
      return reject(Errors.AccessDenied);
    }
  });
}

function succeed(request: Request, response: Response, next: NextFunction) {
  if (isHookSet(options.onSuccess)) {
    options.onSuccess!(request, response, next);
  } else {
    next();
  }
}

function fail(request: Request, response: Response, reason: string) {
  if (isHookSet(options.onFail)) {
    options.onFail!(request, response, reason);
  } else {
    response.status(401).send({ reason });
  }
}
