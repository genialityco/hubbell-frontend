/* eslint-disable @typescript-eslint/no-explicit-any */
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

const DEFAULT_IMAGE = "https://via.placeholder.com/180x120?text=Sin+Imagen";

const INITIAL: Omit<Product, "_id"> = {
  code: "",
  name: "",
  brand: "",
  provider: "",
  group: "",
  line: "",
  image: "",
  type: "",
  datasheet: "",
  compatibles: [],
  price: 0,
  stock: 0,
};

export default function AdminPanel() {
  const [form, setForm] = useState<Omit<Product, "_id">>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Cambios individuales
  const handleChange = (key: keyof typeof form, value: unknown) => {
    setForm({ ...form, [key]: value });
  };

  // Compatibles desde textarea
  const handleCompatibles = (value: string) => {
    setForm({
      ...form,
      compatibles: value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((code) => ({ code, type: "" })),
    });
  };

  // Crear producto individual
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createProduct({
        ...form,
        image: form.image || DEFAULT_IMAGE,
      });
      setSuccess("Producto creado correctamente");
      setForm(INITIAL);
    } catch {
      setSuccess("Error al crear el producto");
    }
    setLoading(false);
  };

  // CARGA MASIVA DESDE PLANTILLA
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // 1. Preparar todos los productos individuales (por código)
      const productosMap: Record<string, Omit<Product, "_id">> = {};

      rows.forEach((row) => {
        const code = String(row["código"] || "").trim();
        if (!code) return;

        if (!productosMap[code]) {
          productosMap[code] = {
            code,
            name: row["nombre"] || "",
            type: row["tipo"] || "",
            brand: row["marca"] || "",
            provider: row["proveedor"] || "",
            group: row["grupo"] || "",
            line: row["línea"] || "",
            image: row["imagen"] || DEFAULT_IMAGE,
            datasheet: row["ficha_técnica"] || "",
            compatibles: [],
            price: Number(row["precio"] || 0),
            stock: Number(row["stock"] || 0),
          };
        }
      });

      // 2. Asignar compatibles a cada producto principal
      rows.forEach((row) => {
        const code = String(row["código"] || "").trim();
        const compCode = String(row["código_compatible"] || "").trim();
        const compType = String(row["tipo_compatible"] || "").trim();

        if (code && compCode && productosMap[code] && productosMap[code].compatibles) {
          productosMap[code].compatibles.push({
            code: compCode,
            type: compType,
          });
        }
      });

      // 3. Crear productos (todos)
      for (const prod of Object.values(productosMap)) {
        await createProduct({
          ...prod,
          image: prod.image || DEFAULT_IMAGE,
        });
      }
      setSuccess("Carga masiva completada");
    } catch (err) {
      console.error("Error al cargar el archivo:", err);
      setSuccess("Error en la carga masiva");
    }
    setLoading(false);
  };

  // Descargar plantilla ejemplo
  const downloadPlantilla = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "código",
        "nombre",
        "tipo",
        "marca",
        "proveedor",
        "grupo",
        "línea",
        "imagen",
        "ficha_técnica",
        "precio",
        "stock",
        "código_compatible",
        "tipo_compatible",
      ],
      [
        "CX-01",
        "Cable X1",
        "CABLE",
        "Condumex",
        "Acme",
        "Cables",
        "Alta",
        "https://...",
        "https://...",
        1000,
        5,
        "YA25",
        "Conector sup.",
      ],
      [
        "CX-01",
        "Cable X1",
        "CABLE",
        "Condumex",
        "Acme",
        "Cables",
        "Alta",
        "https://...",
        "https://...",
        1000,
        5,
        "YS25",
        "Conector cable",
      ],
      [
        "YA25",
        "Conector YA25",
        "CONECTOR",
        "Hubbell",
        "Acme",
        "Conectores",
        "Baja",
        "https://...",
        "https://...",
        1200,
        2,
        "",
        "",
      ],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_productos.xlsx");
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
          label="Tipo"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
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
          value={(form.compatibles ?? []).map((c) => c.code).join(", ")}
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
        <Button
          variant="outline"
          mb="sm"
          onClick={downloadPlantilla}
          color="blue"
        >
          Descargar plantilla Excel
        </Button>
        <FileInput
          label="Archivo Excel o CSV (usa plantilla)"
          placeholder="Sube un archivo .xlsx o .csv"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
        />
      </Card>

      {success && (
        <Notification
          color={success.includes("Error") ? "red" : "teal"}
          mt="md"
          onClose={() => setSuccess(null)}
        >
          {success}
        </Notification>
      )}
    </Stack>
  );
}
