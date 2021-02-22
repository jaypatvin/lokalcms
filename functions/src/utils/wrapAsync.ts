import { NextFunction, Request, Response } from "express";

const wrapAsync = (fn: (req: Request, res: Response, next?: NextFunction) => any) => {
  return function (req: Request, res: Response, next) {
    fn(req, res, next).catch(e => {
      if (next) next(e);
    });
  };
};


export default wrapAsync;