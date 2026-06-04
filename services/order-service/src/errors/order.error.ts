import { HttpError } from "@ecommerce/shared";

export class OrderError extends HttpError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = "OrderError";
  }
}
