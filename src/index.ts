import { NextFunction, Request, Response } from 'express';
import minimatch from 'minimatch';

import { findRole, parseACLFile } from './helpers';
import { ConfigOptions, HTTPMethods, IACLResource } from './interfaces';

let rules: IACLResource[];
let options: ConfigOptions;

export function config(values: ConfigOptions) {
  rules = parseACLFile(values.file!);
  options = values;
}

export async function authorize(request: Request, response: Response, next: NextFunction) {
  const resourceRule = rules.find((rule) => minimatch(request.path, rule.resource));
  if (!resourceRule) { return fail(request, response, 'RouteHasNoRule'); }
  if (!resourceRule.permissions) { return fail(request, response, 'RouteHasNoPermissions'); }

  if (
    resourceRule!.permissions!.public && (
      resourceRule!.permissions!.public === '*' ||
      resourceRule!.permissions!.public.indexOf(request.method as HTTPMethods) !== -1
    )
  ) {
    return success(request, response, next);
  }

  if (typeof options.preAuthorize === 'function') {
    await options.preAuthorize(request, response);
  }

  const role = findRole(request as any);

  const allowedMethods = resourceRule.permissions![role];

  if (allowedMethods === undefined) {
    return fail(request, response, 'RouteNotAllowed');
  } else if (allowedMethods === '*') {
    return success(request, response, next);
  } else if (allowedMethods.indexOf(request.method as HTTPMethods) !== -1) {
    return success(request, response, next);
  } else {
    return fail(request, response, 'MethodNotAllowed');
  }
}

function success(request: Request, response: Response, next: NextFunction) {
  if (typeof options.onSuccess === 'function') {
    options.onSuccess(request, response, next);
  } else {
    next();
  }
}

function fail(request: Request, response: Response, reason: string) {
  if (typeof options.onFail === 'function') {
    options.onFail(request, response, reason);
  } else {
    response.status(401).send({ reason });
  }
}
