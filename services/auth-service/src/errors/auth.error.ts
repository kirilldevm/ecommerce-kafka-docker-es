import { HttpError } from "@ecommerce/shared";

export class AuthError extends HttpError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = "AuthError";
  }
}
