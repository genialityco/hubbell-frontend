/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button, Card, FileInput, Stack, Notification } from "@mantine/core";
import {
  createProduct,
  fetchProductByCode,
  updateProductCompatibles,
} from "../services/productService";
import * as XLSX from "xlsx";
import type { Product } from "../types/Product";

const DEFAULT_IMAGE =
  "https://ik.imagekit.io/6cx9tc1kx/ChatGPT%20Image%2031%20jul%202025,%2019_47_57.png";

export default function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setLoading(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) throw new Error("El archivo está vacío");

      const columnas = Object.keys(rows[0]);

      const camposPrincipales = new Set([
        "Codigo",
        "Articulo",
        "Tipo",
        "Marca",
        "Grupo",
        "Linea",
        "Imagen Articulo",
        "Ficha tecnica Articulo",
      ]);

      const compatibleKeys = columnas.filter(
        (key) =>
          !camposPrincipales.has(key) &&
          !key.includes("||Imagen") &&
          !key.includes("||Ficha Tecnica")
      );

      const productosMap: Record<string, Omit<Product, "_id">> = {};

      for (const row of rows) {
        const codigo = row["Codigo"] || "";
        const articulo = row["Articulo"] || "";
        if (!codigo || !articulo) continue;

        const tipo = row["Tipo"] || "";
        const marca = row["Marca"] || "";
        const linea = row["Linea"] || "";
        const grupo = row["Grupo"] || "";
        const imagen = row["Imagen Articulo"] || DEFAULT_IMAGE;
        const ficha = row["Ficha tecnica Articulo"] || "";

        if (!productosMap[codigo]) {
          productosMap[codigo] = {
            code: codigo,
            name: articulo,
            type: tipo,
            brand: marca,
            line: linea,
            group: grupo,
            provider: "",
            image: imagen || DEFAULT_IMAGE,
            datasheet: ficha,
            compatibles: [],
            price: 0,
            stock: 0,
          };
        }

        for (const key of compatibleKeys) {
          const compCode = (row[key] || "").toString().trim();
          if (!compCode) continue;

          const imageComp = (row[`${key}||Imagen`] || DEFAULT_IMAGE).toString();
          const fichaComp = (row[`${key}||Ficha Tecnica`] || "").toString();
          const typeComp = key;

          if (!productosMap[compCode]) {
            productosMap[compCode] = {
              code: compCode,
              name: compCode,
              type: typeComp,
              brand: "",
              provider: "",
              group: "",
              line: "",
              image: imageComp || DEFAULT_IMAGE,
              datasheet: fichaComp,
              compatibles: [],
              price: 0,
              stock: 0,
            };
          }

          if (
            !productosMap[codigo].compatibles?.some((c) => c.code === compCode)
          ) {
            productosMap[codigo].compatibles?.push({
              code: compCode,
              type: typeComp,
              datasheet: fichaComp,
            });
          }
        }
      }

      // Crear productos en el backend
      for (const [code, prod] of Object.entries(productosMap)) {
        let exists = false;
        try {
          await fetchProductByCode(code);
          exists = true;
        } catch {
          exists = false;
        }
        if (!exists) {
          try {
            await createProduct({
              ...prod,
              image: prod.image || DEFAULT_IMAGE,
            });
          } catch (error) {
            console.error("Error al crear producto:", prod.code, error);
          }
        }
      }

      // Actualizar compatibles de productos principales
      for (const [code, prod] of Object.entries(productosMap)) {
        if (Array.isArray(prod.compatibles) && prod.compatibles.length > 0) {
          try {
            await updateProductCompatibles(
              code,
              prod.compatibles as unknown as string[]
            );
          } catch (error) {
            console.error("Error actualizando compatibles para:", code, error);
          }
        }
      }

      setSuccess("Carga masiva completada");
      setFile(null);
    } catch (err) {
      console.error("Error general al cargar el archivo:", err);
      setSuccess("Error en la carga masiva");
    }

    setLoading(false);
  };

  const downloadPlantilla = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Codigo",
        "Articulo",
        "Tipo",
        "Marca",
        "Grupo",
        "Linea",
        "Imagen Articulo",
        "Ficha tecnica Articulo",
        "Mi Compatible",
        "Mi Compatible||Imagen",
        "Mi Compatible||Ficha Tecnica",
      ],
      [
        "P001",
        "Producto Principal",
        "CATEGORIA",
        "MARCA",
        "GRUPO 1",
        "LÍNEA 1",
        "",
        "",
        "C001",
        "https://example.com/compatible.png",
        "https://example.com/compatible.pdf",
      ],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_productos_generica.xlsx");
  };

  return (
    <Stack mx="auto" maw={600} mt="lg">
      <Card withBorder>
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
          value={file}
          onChange={setFile}
        />
        <Button
          mt="md"
          loading={loading}
          disabled={!file}
          onClick={() => handleFileUpload(file)}
        >
          Cargar productos
        </Button>
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
