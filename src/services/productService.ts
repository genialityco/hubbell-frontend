// src/services/productService.ts
import axios from "axios";
import type { Product } from "../types/Product";

const API_URL = "http://localhost:5000/api/products";
// const API_URL = "https://hubbell-backend-vmetx.ondigitalocean.app/api/products";

type ProductsResponse = {
  products: Product[];
  filters: {
    types: { name: string; count: number }[];
  };
  total: number;
};

export const createProduct = async (product: Omit<Product, "_id">) => {
  await axios.post(API_URL, product);
};

export const searchProducts = async (query: string, categories: string[]) => {
  const res = await axios.post<ProductsResponse>(`${API_URL}/search`, {
    query,
    categories,
  });
  return res.data;
};

export const fetchProducts = async (): Promise<ProductsResponse> => {
  const res = await axios.get<ProductsResponse>(API_URL);
  return res.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const res = await axios.get<Product>(`${API_URL}/${id}`);
  return res.data;
};

// src/services/productService.ts
export const fetchProductByCode = async (code: string) => {
  const res = await axios.get(`${API_URL}/code?code=${encodeURIComponent(code)}`);
  return res.data;
};
