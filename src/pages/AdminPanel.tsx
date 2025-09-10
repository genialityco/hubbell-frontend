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

  // --- Helpers ---

  // Normaliza cadenas: minúsculas, sin acentos, espacios colapsados
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // Encuentra la columna hermana tolerando diferencias leves en el nombre base
  function findSiblingColumn(
    columns: string[],
    base: string,
    kind: "Imagen" | "Ficha Tecnica"
  ): string | null {
    const exact = `${base}||${kind}`;
    if (columns.includes(exact)) return exact;

    // Recorta palabras desde el final: "Conector a superficie plana" -> "Conector a superficie"
    const tokens = base.split(/\s+/);
    for (let cut = tokens.length - 1; cut >= 1; cut--) {
      const partial = tokens.slice(0, cut).join(" ");
      const candidate = `${partial}||${kind}`;
      if (columns.includes(candidate)) return candidate;
    }

    // Búsqueda por prefijo normalizado
    const nBase = norm(base);
    const candidates = columns.filter((c) => c.endsWith("||" + kind));
    for (const c of candidates) {
      const left = c.split("||")[0];
      const nLeft = norm(left);
      if (nLeft.startsWith(nBase) || nBase.startsWith(nLeft)) {
        return c;
      }
    }
    return null;
  }

  // Limpia keys por fila (trim de encabezados)
  function trimRowKeys(row: Record<string, any>) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      out[k.trim()] = v;
    }
    return out;
  }

  const handleFileUpload = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setLoading(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rowsRaw: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rowsRaw.length === 0) throw new Error("El archivo está vacío");

      // Normaliza headers por fila
      const rows = rowsRaw.map(trimRowKeys);

      // Recolecta TODAS las columnas (trim) porque algunos encabezados pueden variar por fila
      const columnasSet = new Set<string>();
      for (const r of rows) {
        Object.keys(r).forEach((k) => columnasSet.add(k));
      }
      const columnas = Array.from(columnasSet);

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

      // Todas las columnas que son "bases" de compatibles (no principales ni hermanas directas)
      const compatibleKeys = columnas.filter(
        (key) =>
          !camposPrincipales.has(key) &&
          !key.includes("||Imagen") &&
          !key.includes("||Ficha Tecnica")
      );

      const productosMap: Record<string, Omit<Product, "_id">> = {};

      for (const row of rows) {
        const codigo = (row["Codigo"] || "").toString().trim();
        const articulo = (row["Articulo"] || "").toString().trim();
        if (!codigo || !articulo) continue;

        const tipo = (row["Tipo"] || "").toString().trim();
        const marca = (row["Marca"] || "").toString().trim();
        const linea = (row["Linea"] || "").toString().trim();
        const grupo = (row["Grupo"] || "").toString().trim();
        const imagen = (row["Imagen Articulo"] || DEFAULT_IMAGE).toString().trim();
        const ficha = (row["Ficha tecnica Articulo"] || "").toString().trim();

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

          // Busca las columnas hermanas aun si el Excel no coincide 1:1
          const imageCol = findSiblingColumn(columnas, key, "Imagen");
          const fichaCol = findSiblingColumn(columnas, key, "Ficha Tecnica");

          const imageComp = ((imageCol ? row[imageCol] : "") || DEFAULT_IMAGE)
            .toString()
            .trim();
          const fichaComp = ((fichaCol ? row[fichaCol] : "") || "")
            .toString()
            .trim();
          const typeComp = key; // usamos el nombre de la columna base como "tipo" del compatible

          // Crea (si no existe) el producto compatible con sus metadatos
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
          } else {
            // Si ya existe pero no tiene imagen/datasheet, complétalos
            if (!productosMap[compCode].image)
              productosMap[compCode].image = imageComp || DEFAULT_IMAGE;
            if (!productosMap[compCode].datasheet && fichaComp)
              productosMap[compCode].datasheet = fichaComp;
          }

          // Vincula el compatible al producto principal (evita duplicados)
          const list = productosMap[codigo].compatibles || [];
          if (!list.some((c: any) => c.code === compCode)) {
            list.push({
              code: compCode,
              type: typeComp,
              datasheet: fichaComp,
            });
            productosMap[codigo].compatibles = list as any;
          }
        }
      }

      // 1) Crear productos que no existan
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

      // 2) Actualizar compatibles de productos principales
      for (const [code, prod] of Object.entries(productosMap)) {
        if (Array.isArray(prod.compatibles) && prod.compatibles.length > 0) {
          try {
            // Enviar el arreglo de objetos tal cual (NO castear a string[])
            await updateProductCompatibles(code, prod.compatibles as any);
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
        <Button variant="outline" mb="sm" onClick={downloadPlantilla} color="blue">
          Descargar plantilla Excel
        </Button>
        <FileInput
          label="Archivo Excel o CSV (usa plantilla)"
          placeholder="Sube un archivo .xlsx o .csv"
          accept=".xlsx, .xls, .csv"
          value={file}
          onChange={setFile}
        />
        <Button mt="md" loading={loading} disabled={!file} onClick={() => handleFileUpload(file)}>
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
