import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "./error.middleware";

/**
 * Creates a validation middleware for request body, query, or params.
 * Uses Zod schemas for type-safe validation.
 *
 * @example
 * router.post("/notes", validate(createNoteSchema, "body"), createNote);
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");

      next(new BadRequestError(`Validation failed: ${messages}`));
      return;
    }

    // Replace the source with parsed/transformed data
    (req as any)[source] = result.data;
    next();
  };
}
