import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erro na aplicação:', error);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
}; 