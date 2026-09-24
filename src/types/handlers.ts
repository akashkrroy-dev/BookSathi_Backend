import type { Request, Response, NextFunction } from "express";

export type Controller = (
  req: Request,
  res: Response
) => Promise<void> | void;

export type NextHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | void;