import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
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
import { fetchProducts } from "../services/productService";
import type { Product } from "../types/Product";
import CustomLoader from "../components/CustomLoader";

export default function ProductDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [compatibles, setCompatibles] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      const realCode = code ? decodeURIComponent(code) : "";
      const found = data.products.find((p: Product) => p.code === realCode);
      setProduct(found || null);

      if (found?.compatibles && found.compatibles.length > 0) {
        const compatiblesCodes = found.compatibles.map((c) => c.code);
        const codesSet = new Set(
          compatiblesCodes.map((c) => c.trim().toLowerCase())
        );
        const compatiblesList = data.products.filter((p: Product) =>
          codesSet.has(p.code.trim().toLowerCase())
        );
        setCompatibles(compatiblesList);
      } else {
        setCompatibles([]);
      }
      setLoading(false);
    });
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
        <Button variant="light" size="xs" onClick={() => navigate("/productos")}>
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
              {product.stock === 0 && (
                <Badge color="red" size="sm" variant="filled">
                  Sin stock
                </Badge>
              )}
            </Group>

            <Text fw={700} size="2xl" lh={1.2}>
              {product.name}
            </Text>
            <Text c="dimmed" size="sm" mb={2}>
              Código: <b>{product.code}</b>
            </Text>
            {product.provider && (
              <Text size="sm" c="dimmed">
                Proveedor: {product.provider}
              </Text>
            )}
            {product.group && (
              <Text size="sm" c="dimmed">
                Grupo: {product.group}
              </Text>
            )}

            <Group gap={24} mt={14} mb={2}>
              <Text size="xl" fw={600} color="dark">
                {product.price ? `$${product.price.toLocaleString()}` : <span style={{color:"#ccc"}}>Sin precio</span>}
              </Text>
              <Text size="sm" c="dimmed">
                Stock:{" "}
                <b>
                  {product.stock === undefined
                    ? "-"
                    : product.stock === 0
                    ? "Sin stock"
                    : product.stock}
                </b>
              </Text>
            </Group>

            <Group mt={16} gap={14}>
              <Button size="lg" radius="xl" color="dark">
                Agregar al carrito
              </Button>
              {/* {product.datasheet && ( */}
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
              {/* )} */}
            </Group>
          </Stack>
        </Flex>
      </Paper>

      <Divider my="xl" label="Compatibles" labelPosition="center" />

      {/* Compatibles */}
      <Text fw={700} size="lg" mb={8}>
        {compatibles.length === 0
          ? "Sin productos compatibles"
          : `Productos compatibles (${compatibles.length})`}
      </Text>
      {compatibles.length === 0 ? (
        <Text c="dimmed" mb="xl">
          Este producto no tiene productos compatibles registrados.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mb="lg">
          {compatibles.map((comp) => (
            <Card
              key={comp.code}
              withBorder
              radius="xl"
              shadow="md"
              style={{
                background: "#f8fafc",
                minHeight: 230,
                cursor: "pointer",
                border: "2px solid #f1f3f6",
                transition: "box-shadow 0.2s, border 0.2s",
              }}
              onClick={() =>
                navigate(`/product/${encodeURIComponent(comp.code)}`)
              }
              onMouseOver={e => (e.currentTarget.style.border = '2px solid #777')}
              onMouseOut={e => (e.currentTarget.style.border = '2px solid #f1f3f6')}
            >
              <Card.Section style={{ position: "relative", margin: "10px 10px 0 10px" }}>
                <Image
                  src={comp.image || ""}
                  alt={comp.name || "Producto"}
                  height={110}
                  fit="contain"
                  fallbackSrc="https://via.placeholder.com/180x110?text=Sin+Imagen"
                  style={{ objectFit: "cover", borderRadius: 12, background: "#fff" }}
                />
              </Card.Section>
              <Stack align="center" gap={0} mt="md">
                <Text size="md" fw={600}>
                  {comp.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {comp.code}
                </Text>
                <Text size="xs" c="dimmed">
                  {comp.type || "Sin tipo"}
                </Text>
              </Stack>
              <Button
                size="xs"
                radius="xl"
                color="dark"
                mt={12}
                mb={6}
                fullWidth
              >
                Agregar al carrito
              </Button>
              {comp.datasheet && (
                <Text
                  component="a"
                  href={comp.datasheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  mt="xs"
                  c="blue"
                  style={{
                    textAlign: "center",
                    textDecoration: "underline",
                    display: "block",
                  }}
                >
                  Ver ficha técnica ↗
                </Text>
              )}
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
