import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Group,
  SimpleGrid,
  Text,
  Image,
  Stack,
  Badge,
  Divider,
  Flex,
  Paper,
} from "@mantine/core";
import { fetchProductByCode } from "../services/productService";
import type { Product } from "../types/Product";
import CustomLoader from "../components/CustomLoader";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [compatibles, setCompatibles] = useState<Product[]>([]);
  const [compatibleWith, setCompatibleWith] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    // Llamada al backend que retorna { product, compatibles, compatibleWith }
    type ProductDetailResponse = {
      product: Product | null;
      compatibles?: Product[];
      compatibleWith?: Product[];
    };

    fetchProductByCode(decodeURIComponent(code)).then(
      (data: ProductDetailResponse) => {
        setProduct(data.product);
        setCompatibles(data.compatibles || []);
        setCompatibleWith(data.compatibleWith || []);
        setLoading(false);
      }
    );
  }, [code]);

  if (loading) return <CustomLoader />;

  if (!product) {
    return (
      <Box p="xl">
        <Text fw={700} size="xl" mb="lg">
          Producto no encontrado
        </Text>
        <Button variant="outline" onClick={() => navigate("/productos")}>
          Volver al catálogo
        </Button>
      </Box>
    );
  }

  return (
    <Box maw={950} mx="auto" pt="xl" pb="lg" px="md">
      {/* Breadcrumb y botón volver */}
      <Group mb="md" gap="xs">
        <Button
          variant="light"
          size="xs"
          onClick={() => navigate("/productos")}
        >
          ← Catálogo
        </Button>
        <Text c="dimmed" size="sm" mx={5}>
          /
        </Text>
        <Text size="sm" c="gray">
          {product.name}
        </Text>
      </Group>

      {/* Card principal */}
      <Paper
        shadow="md"
        radius="xl"
        p={0}
        mb="xl"
        style={{
          background: "linear-gradient(110deg,#f8fafc 80%,#e9ecef 100%)",
          boxShadow: "0 4px 32px 0 #e9e9e9",
        }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={36}
          align="flex-start"
          p={{ base: "xl", md: 32 }}
        >
          <Image
            src={product.image || ""}
            alt={product.name || "Producto"}
            width={200}
            height={200}
            fit="contain"
            fallbackSrc="https://via.placeholder.com/200x200?text=Sin+Imagen"
            style={{ borderRadius: 16, background: "#fff" }}
          />

          <Stack gap={6} w="100%">
            <Group gap="xs" mb={4}>
              <Badge color="gray" size="sm" variant="light">
                {product.type || "Sin tipo"}
              </Badge>
              {product.line && (
                <Badge color="blue" size="sm" variant="light">
                  {product.line}
                </Badge>
              )}
              {product.brand && (
                <Badge color="indigo" size="sm" variant="light">
                  {product.brand}
                </Badge>
              )}
              {/* {product.stock === 0 && (
                <Badge color="red" size="sm" variant="filled">
                  Sin stock
                </Badge>
              )} */}
            </Group>

            <Text fw={700} size="2xl" lh={1.2}>
              {product.name}
            </Text>
            <Text c="dimmed" size="sm" mb={2}>
              Código: <b>{product.code}</b>
            </Text>
            {/* {product.provider && (
              <Text size="sm" c="dimmed">
                Proveedor: {product.provider}
              </Text>
            )} */}
            {product.group && (
              <Text size="sm" c="dimmed">
                Grupo: {product.group}
              </Text>
            )}

            <Group gap={24} mt={14} mb={2}>
              {/* <Text size="xl" fw={600} color="dark">
                {product.price ? (
                  `$${product.price.toLocaleString()}`
                ) : (
                  <span style={{ color: "#ccc" }}>Sin precio</span>
                )}
              </Text> */}
              {/* <Text size="sm" c="dimmed">
                Stock:{" "}
                <b>
                  {product.stock === undefined
                    ? "-"
                    : product.stock === 0
                    ? "Sin stock"
                    : product.stock}
                </b>
              </Text> */}
            </Group>

            <Group mt={16} gap={14}>
              {/* <Button size="lg" radius="xl" color="dark">
                Agregar al carrito
              </Button> */}
              {/* {product.datasheet && ( */}
              {product.datasheet && (
                <Button
                  variant="outline"
                  size="md"
                  radius="xl"
                  component="a"
                  href={product.datasheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="gray"
                  leftSection="↗"
                  px={16}
                >
                  Ficha técnica
                </Button>
              )}
              {/* )} */}
            </Group>
          </Stack>
        </Flex>
      </Paper>

      <Divider my="xl" label="Productos compatibles" labelPosition="center" />

      {(() => {
        const relacionadosMap = new Map<string, Product>();
        [...compatibles, ...compatibleWith].forEach((p) =>
          relacionadosMap.set(p.code, p)
        );
        const relacionados = Array.from(relacionadosMap.values());

        return relacionados.length === 0 ? (
          <>
            <Text fw={700} size="lg" mb={8}>
              Sin productos compatibles
            </Text>
            <Text c="dimmed" mb="xl">
              Este producto no tiene compatibles registradas con otros
              productos.
            </Text>
          </>
        ) : (
          <>
            <Text fw={700} size="lg" mb={8}>
              Productos compatibles ({relacionados.length})
            </Text>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
              spacing="lg"
              mb="lg"
            >
              {relacionados.map((prod) => (
                <ProductCard key={prod.code} product={prod} />
              ))}
            </SimpleGrid>
          </>
        );
      })()}
    </Box>
  );
}
