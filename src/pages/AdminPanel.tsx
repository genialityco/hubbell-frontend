// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react";
// import { Button, Card, FileInput, Stack, Notification } from "@mantine/core";
// import {
//   createProduct,
//   fetchProductByCode,
//   updateProductCompatibles,
// } from "../services/productService";
// import * as XLSX from "xlsx";
// import type { Product } from "../types/Product";

// const DEFAULT_IMAGE = "https://via.placeholder.com/180x120?text=Sin+Imagen";

// export default function AdminPanel() {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState<string | null>(null);

//   // Define compatibles, imágenes y fichas según tus columnas exactas:
//   const compatibleKeys = [
//     "Conector a superficie plana",
//     "Conector cable-cable",
//     "Conector mecánico 1",
//     "Conector mecánico 2",
//     "Dado 1",
//     "Dado 2",
//     "Herramienta h. de baterias",
//     "Herramienta hidráulica",
//     "Herramienta mecánica",
//     "Hta. de corte (cable)",
//   ];

//   const imagenKeys = [
//     "Conector a superficie\n||Imagen",
//     "Conector cable-cable\n||Imagen ",
//     "Conector mecánico 1\n||Imagen",
//     "Conector mecánico 2\n||Imagen",
//     "Dado 1\n||Imagen",
//     "Dado 2\n||Imagen",
//     "Herramienta h. de baterías\n||Imagen",
//     "Herramienta hidáulica\n||Imagen",
//     "Herramienta mecánica\n||Imagen",
//     "Hta. de corte (cable)\n||Imagen",
//   ];

//   const fichaKeys = [
//     "Conector a superficie\n||Ficha Técnica",
//     "Conector cable-cable\n||Ficha Técnica",
//     "Conector mecánico 1\n||Ficha Técnica",
//     "Conector mecánico 2\n||Ficha Técnica",
//     "Dado 1\n||Ficha Técnica",
//     "Dado 2\n||Ficha Técnica",
//     "Herramienta h. de baterias\n||Ficha Técnica",
//     "Herramienta hidáulica\n||Ficha Técnica",
//     "Herramienta mecánica\n||Ficha Técnica",
//     "Hta. de corte (cable)\n||Ficha Técnica",
//   ];

//   const handleFileUpload = async (selectedFile: File | null) => {
//     if (!selectedFile) return;
//     setLoading(true);

//     try {
//       const data = await selectedFile.arrayBuffer();
//       const workbook = XLSX.read(data);
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

//       // Para depuración
//       console.log("Filas del Excel:", rows);

//       // Map para evitar duplicados en la sesión de carga
//       const productosMap: Record<string, Omit<Product, "_id">> = {};

//       for (const row of rows) {
//         // --- PRODUCTO PRINCIPAL ---
//         const codigo = row["Codigo"] || row["codigo"] || "";
//         const articulo = row["Articulo"] || row["articulo"] || "";
//         if (!codigo || !articulo) {
//           console.warn("Fila sin código o sin nombre, se omite:", row);
//           continue;
//         }

//         // Extrae el resto de campos
//         const tipo = row["Tipo"] || row["tipo"] || "";
//         const marca = row["Marca"] || row["marca"] || "";
//         const linea = row["Linea"] || row["Línea"] || row["linea"] || row["línea"] || "";
//         const grupo = row["Grupo"] || row["grupo"] || "";
//         const imagen = row["Imagen Articulo"] || row["Imagen"] || row["imagen"] || DEFAULT_IMAGE;
//         const ficha = row["Ficha tecnica Articulo"] || row["Ficha técnica"] || "";

//         if (!productosMap[codigo]) {
//           productosMap[codigo] = {
//             code: codigo,
//             name: articulo,
//             type: tipo,
//             brand: marca,
//             line: linea,
//             group: grupo,
//             provider: "",
//             image: imagen || DEFAULT_IMAGE,
//             datasheet: ficha,
//             compatibles: [],
//             price: 0,
//             stock: 0,
//           };
//           //console.log("Agregado producto principal:", productosMap[codigo]);
//         }

//         // --- COMPATIBLES ---
//         for (let i = 0; i < compatibleKeys.length; i++) {
//           const code = (row[compatibleKeys[i]] || "").toString().trim();
//           if (!code) continue;

//           const imageComp = (row[imagenKeys[i]] || DEFAULT_IMAGE).toString();
//           const fichaComp = (row[fichaKeys[i]] || "").toString();

//           if (!productosMap[code]) {
//             productosMap[code] = {
//               code,
//               name: code,
//               type: "",
//               brand: "",
//               provider: "",
//               group: "",
//               line: "",
//               image: imageComp || DEFAULT_IMAGE,
//               datasheet: fichaComp,
//               compatibles: [],
//               price: 0,
//               stock: 0,
//             };
//             //console.log("Agregado compatible:", productosMap[code]);
//           }

//           if (!productosMap[codigo].compatibles.some((c) => c.code === code)) {
//             productosMap[codigo].compatibles.push({
//               code,
//               type: "",
//             });
//           }
//         }
//       }

//       // Depura el mapa resultante:
//       console.log("Mapa de productos a procesar:", productosMap);

//       // --- CREAR/ACTUALIZAR PRODUCTOS EN EL BACKEND ---
//       for (const [code, prod] of Object.entries(productosMap)) {
//         let exists = false;
//         try {
//           await fetchProductByCode(code);
//           exists = true;
//         } catch (err) {
//           exists = false;
//         }
//         if (!exists) {
//           try {
//             await createProduct({
//               ...prod,
//               image: prod.image || DEFAULT_IMAGE,
//             });
//           } catch (error) {
//             console.error("Error al crear producto:", prod.code, error);
//           }
//         }
//       }

//       // --- ACTUALIZAR LOS COMPATIBLES SOLO DE LOS PRINCIPALES ---
//       for (const [code, prod] of Object.entries(productosMap)) {
//         if (prod.compatibles.length > 0) {
//           try {
//             await updateProductCompatibles(code, prod.compatibles);
//           } catch (error) {
//             console.error("Error actualizando compatibles para:", code, error);
//           }
//         }
//       }

//       setSuccess("Carga masiva completada");
//       setFile(null);
//     } catch (err) {
//       console.error("Error general al cargar el archivo:", err);
//       setSuccess("Error en la carga masiva");
//     }
//     setLoading(false);
//   };

//   // Descargar plantilla ejemplo
//   const downloadPlantilla = () => {
//     const ws = XLSX.utils.aoa_to_sheet([
//       [
//         "Codigo",
//         "Articulo",
//         "Tipo",
//         "Marca",
//         "Grupo",
//         "Linea",
//         "Imagen Articulo",
//         "Ficha tecnica Articulo",
//         // ... agrega tus compatibles y sus imágenes/fichas aquí ...
//       ],
//       [
//         "CX-CTHW-1/0CM",
//         "MTS CABLE THW CAL 1/0 NGO CM",
//         "CONDUCTORES",
//         "CONDUMEX",
//         "CX CABLE VINANEL FORRADOS DE COBRE",
//         "CXCTHW",
//         "",
//         "",
//         // ... ejemplos para compatibles ...
//       ],
//     ]);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
//     XLSX.writeFile(wb, "plantilla_productos.xlsx");
//   };

//   return (
//     <Stack mx="auto" maw={600} mt="lg">
//       <Card withBorder>
//         <h2>Cargar productos masivamente</h2>
//         <Button
//           variant="outline"
//           mb="sm"
//           onClick={downloadPlantilla}
//           color="blue"
//         >
//           Descargar plantilla Excel
//         </Button>
//         <FileInput
//           label="Archivo Excel o CSV (usa plantilla)"
//           placeholder="Sube un archivo .xlsx o .csv"
//           accept=".xlsx, .xls, .csv"
//           value={file}
//           onChange={setFile}
//           loading={loading}
//         />
//         <Button
//           mt="md"
//           loading={loading}
//           disabled={!file}
//           onClick={() => handleFileUpload(file)}
//         >
//           Cargar productos
//         </Button>
//       </Card>

//       {success && (
//         <Notification
//           color={success.includes("Error") ? "red" : "teal"}
//           mt="md"
//           onClose={() => setSuccess(null)}
//         >
//           {success}
//         </Notification>
//       )}
//     </Stack>
//   );
// }
