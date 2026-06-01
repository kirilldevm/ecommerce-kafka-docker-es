import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type { Product, ProductResponse, ProductsResponse } from '@/types/product.types';

export class ProductService {
  async listProducts(): Promise<Product[]> {
    const { data } = await apiClient.get<ProductsResponse>(endpoints.products.list);
    return data.products;
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<ProductResponse>(endpoints.products.byId(id));
    return data.product;
  }
}

export const productService = new ProductService();
