import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (res.headersSent) {
    next(err);
    return;
  }

  const status = (err as any).status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}
