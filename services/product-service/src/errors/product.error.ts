import { HttpError } from '@ecommerce/shared';

export class ProductError extends HttpError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'ProductError';
  }
}
