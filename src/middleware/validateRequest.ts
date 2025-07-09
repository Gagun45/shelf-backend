import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      console.log("validation error", err);
      res.status(400).json({ message: err });
      return;
    }
  };

export default validateRequest;
