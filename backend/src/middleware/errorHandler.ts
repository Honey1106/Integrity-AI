import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || 500
  const code = err.code || (status === 409 ? 'CONFLICT' : status === 404 ? 'NOT_FOUND' : status === 422 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR')
  const message = err.message || 'Internal server error'

  res.status(status).json({
    error: {
      code,
      message,
      ...(err.issues ? { issues: err.issues } : {}),
    },
  })
}
