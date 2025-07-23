// src/services/productService.ts
import axios from "axios";
import type { Product } from "../types/Product";

//const API_URL = "https://hubbell-backend.vercel.app/api/products";
const API_URL  = "https://hubbell-backend-vmetx.ondigitalocean.app/api/products";

interface ProductsResponse {
  products: Product[];
  total: number;
}


export const createProduct = async (product: Omit<Product, "_id">) => {
  await axios.post(API_URL, product);
};

export const fetchProducts = async (): Promise<ProductsResponse> => {
  const res = await axios.get<ProductsResponse>(API_URL);
  return res.data;
};


export const fetchProductById = async (id: string): Promise<Product> => {
  const res = await axios.get<Product>(`${API_URL}/${id}`);
  return res.data;
};

export const fetchProductsByCodes = async (
  codes: string[]
): Promise<Product[]> => {
  if (codes.length === 0) return [];
  const params = new URLSearchParams();
  codes.forEach((code) => params.append("code", code));
  const res = await axios.get<Product[]>(
    `${API_URL}/by-codes?${params.toString()}`
  );
  return res.data;
};
