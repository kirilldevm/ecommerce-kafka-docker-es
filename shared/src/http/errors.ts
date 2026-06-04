export class HttpError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export type HttpErrorConstructor = new (
  message: string,
  statusCode: number,
) => HttpError;
