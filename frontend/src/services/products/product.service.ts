import { endpoints } from '@/config/endpoints.config';
import { apiClient } from '@/lib/api-client';
import type {
  CreateProductRequest,
  Product,
  ProductResponse,
  ProductsResponse,
  UpdateProductRequest,
} from '@/types/product.types';

export class ProductService {
  async listProducts(): Promise<Product[]> {
    const { data } = await apiClient.get<ProductsResponse>(endpoints.products.list);
    return data.products;
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<ProductResponse>(endpoints.products.byId(id));
    return data.product;
  }

  async createProduct(payload: CreateProductRequest): Promise<Product> {
    const { data } = await apiClient.post<ProductResponse>(endpoints.products.list, payload);
    return data.product;
  }

  async updateProduct(id: string, payload: UpdateProductRequest): Promise<Product> {
    const { data } = await apiClient.patch<ProductResponse>(endpoints.products.byId(id), payload);
    return data.product;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(endpoints.products.byId(id));
  }
}

export const productService = new ProductService();
