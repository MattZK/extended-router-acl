import { NextFunction, Request, Response } from 'express';

import { ConfigOptions } from './src/interfaces';

export function config(data: ConfigOptions): void;
export function authorize(request: Request, response: Response, next: NextFunction): void;
