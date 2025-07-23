/* eslint-disable no-dupe-else-if */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/AdminPanel.tsx
import { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Card,
  FileInput,
  Stack,
  Textarea,
  Notification,
} from "@mantine/core";
import { createProduct } from "../services/productService";
import * as XLSX from "xlsx";
import type { Product } from "../types/Product";

const INITIAL: Omit<Product, "_id"> = {
  code: "",
  name: "",
  brand: "",
  provider: "",
  group: "",
  line: "",
  image: "",
  datasheet: "",
  compatibles: [],
  price: 0,
  stock: 0,
};

export default function AdminPanel() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleCompatibles = (value: string) => {
    // Convierte la lista separada por comas a array de string (limpia espacios)
    setForm({
      ...form,
      compatibles: value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createProduct(form);
      setSuccess("Producto creado correctamente");
      setForm(INITIAL);
    } catch {
      setSuccess("Error al crear el producto");
    }
    setLoading(false);
  };

  // --- CARGA MASIVA ---
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setLoading(true);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Procesa productos principales y compatibles
    let currentPrincipal: any = null;
    const productos: Omit<Product, "_id">[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Un producto principal es aquel que tiene código y nombre
      if (row.Codigo && row.ARTICULO) {
        if (currentPrincipal) {
          productos.push(currentPrincipal); // Guarda el anterior
        }
        // Nuevo producto principal
        currentPrincipal = {
          code: String(row.Codigo),
          name: row.ARTICULO,
          brand: row.Marca,
          provider: row.Proveedor,
          group: row.Grupo,
          line: row.Linea,
          image:
            row["Imagen columna X"] ||
            row["Imagen columna V"] ||
            row["Imagen columna T"] ||
            "",
          datasheet:
            row["Ficha Técnica columan Q"] ||
            row["Ficha Técnica columan S"] ||
            "",
          compatibles: [],
          price: Number(row.price || row.precio || 0), // Ajusta si tienes columnas de precio
          stock: Number(row.stock || 0),
        };
      } else if (currentPrincipal && row.Codigo && row.ARTICULO) {
        // Es compatible del producto principal actual
        currentPrincipal.compatibles.push(String(row.Codigo));
      }
    }
    if (currentPrincipal) productos.push(currentPrincipal);

    // Carga todos los productos
    try {
      for (const prod of productos) {
        await createProduct(prod);
      }
      setSuccess("Carga masiva completada");
    } catch {
      setSuccess("Error en la carga masiva");
    }
    setLoading(false);
  };

  return (
    <Stack mx="auto" maw={500} mt="lg">
      <Card withBorder>
        <h2>Agregar producto individual</h2>
        <TextInput
          label="Código"
          value={form.code}
          onChange={(e) => handleChange("code", e.target.value)}
          required
        />
        <TextInput
          label="Nombre"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
        <TextInput
          label="Marca"
          value={form.brand}
          onChange={(e) => handleChange("brand", e.target.value)}
        />
        <TextInput
          label="Proveedor"
          value={form.provider}
          onChange={(e) => handleChange("provider", e.target.value)}
        />
        <TextInput
          label="Grupo"
          value={form.group}
          onChange={(e) => handleChange("group", e.target.value)}
        />
        <TextInput
          label="Línea"
          value={form.line}
          onChange={(e) => handleChange("line", e.target.value)}
        />
        <TextInput
          label="URL Imagen"
          value={form.image}
          onChange={(e) => handleChange("image", e.target.value)}
        />
        <TextInput
          label="URL Ficha Técnica"
          value={form.datasheet}
          onChange={(e) => handleChange("datasheet", e.target.value)}
        />
        <Textarea
          label="Compatibles (códigos separados por coma)"
          value={(form.compatibles ?? []).join(", ")}
          onChange={(e) => handleCompatibles(e.target.value)}
        />
        <NumberInput
          label="Precio"
          value={form.price}
          min={0}
          onChange={(val) => handleChange("price", Number(val))}
        />
        <NumberInput
          label="Stock"
          value={form.stock}
          min={0}
          onChange={(val) => handleChange("stock", Number(val))}
        />
        <Button mt="md" loading={loading} onClick={handleSubmit}>
          Crear producto
        </Button>
      </Card>

      <Card withBorder mt="xl">
        <h2>Cargar productos masivamente</h2>
        <FileInput
          label="Archivo Excel o CSV"
          placeholder="Sube un archivo .xlsx o .csv"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
        />
      </Card>

      {success && (
        <Notification color="teal" mt="md" onClose={() => setSuccess(null)}>
          {success}
        </Notification>
      )}
    </Stack>
  );
}
