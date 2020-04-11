import { NextFunction, Request, Response } from 'express';

export interface ConfigOptions {
  file?: string;
  onFail?: (request: Request, response: Response, reason: string) => any;
  onSuccess?: (request: Request, response: Response, next: NextFunction) => any;
  preAuthorize?: (request: Request, response: Response) => Promise<any>;
}

export interface IACLResource {
  resource: string;
  permissions?: {
    [key: string]: HTTPMethods[] | '*';
  };
}

export enum HTTPMethods {
  'GET' = 'GET',
  'POST' = 'POST',
  'PUT' = 'PUT',
  'PATCH' = 'DELETE',
  'SEARCH' = 'SEARCH',
}
