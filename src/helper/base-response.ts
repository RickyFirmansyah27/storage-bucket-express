import type { Response } from 'express';

export const BaseResponse = (
  res: Response,
  resMessage: string,
  type: string,
  result: any = null,
) => {
  let responseData;
  let status = 200; // Default status code

  switch (type) {
    case 'badRequest':
      responseData = { statusCode: 400, status: false, message: resMessage };
      status = 400;
      break;
    case 'created':
      responseData = { statusCode: 201, status: true, message: resMessage };
      status = 201;
      break;
    case 'success':
      responseData = { statusCode: 200, status: true, message: resMessage, data: result };
      break;
    case 'unauthorized':
      responseData = { statusCode: 403, status: false, error: resMessage };
      status = 403;
      break;
    case 'internalServerError':
      responseData = { statusCode: 500, status: false, error: resMessage };
      status = 500;
      break;
    default:
      responseData = { statusCode: 200, status: true, message: resMessage, data: result };
      break;
  }

  return res.status(status).json(responseData);
};
