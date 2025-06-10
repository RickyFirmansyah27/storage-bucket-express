import { Request, Response, NextFunction } from 'express';
import boom from '@hapi/boom';

export const ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const boomError = boom.boomify(err);
  res.status(boomError.output.statusCode).json({
    message: boomError.message,
    statusCode: boomError.output.statusCode,
  });
};
