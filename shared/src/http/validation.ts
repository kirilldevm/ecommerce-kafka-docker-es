import type { ZodError, ZodType, ZodTypeDef } from "zod";
import { HttpError, type HttpErrorConstructor } from "./errors";

function formatZodIssue(error: ZodError): string {
  const first = error.issues[0];
  if (!first) {
    return "Validation failed";
  }

  const path = first.path.length > 0 ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}

export function parseBody<TOutput>(
  schema: ZodType<TOutput, ZodTypeDef, unknown>,
  body: unknown,
  ErrorClass: HttpErrorConstructor = HttpError,
): TOutput {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ErrorClass(formatZodIssue(result.error), 400);
  }

  return result.data;
}

export function parseQuery<TOutput>(
  schema: ZodType<TOutput, ZodTypeDef, unknown>,
  query: unknown,
  ErrorClass: HttpErrorConstructor = HttpError,
): TOutput {
  return parseBody(schema, query, ErrorClass);
}
