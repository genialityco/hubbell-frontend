// src/types/Product.ts

export interface ProductCompatible {
  type: string;   // Tipo de compatible, ej: "Conector a superficie plana"
  code: string;   // Código del producto compatible
}

export interface Product {
  code: string;              // Codigo (SKU único)
  name: string;              // ARTICULO (nombre)
  brand?: string;            // Marca
  provider?: string;         // Proveedor
  group?: string;            // Grupo (subcategoría)
  line?: string;             // Linea (categoría)
  image?: string;            // Imagen principal
  type?: string;             // Tipo (ej: "Conector", "Cable", etc.)
  datasheet?: string;        // Ficha técnica
 compatibles?: string[]; // 👈 no ProductCompatible[]
  price?: number;
  stock?: number;
}
