import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProductById,
  fetchProductsByCodes,
} from "../services/productService";
import {
  Card,
  Button,
  Loader,
  Image,
  Text,
  Group,
  Stack,
  SimpleGrid,
  Title,
} from "@mantine/core";
import type { Product } from "../types/Product";

export default function ProductDetail() {
  const { code } = useParams<{ code: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [compatibles, setCompatibles] = useState<Product[]>([]);
  const [loadingCompatibles, setLoadingCompatibles] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetchProductById(code).then((data) => {
      setProduct(data);
      setLoading(false);

      // Cargar compatibles si existen
      if (data.compatibles && data.compatibles.length > 0) {
        setLoadingCompatibles(true);
        fetchProductsByCodes(data.compatibles)
          .then((res) => setCompatibles(res))
          .finally(() => setLoadingCompatibles(false));
      } else {
        setCompatibles([]);
      }
    });
  }, [code]);

  if (loading || !product) return <Loader />;

  return (
    <Stack gap={0}>
      {/* Detalle del producto principal */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Group align="flex-start" gap={32}>
          <Image
            src={product.image || ""}
            alt={product.name || "Producto"}
            width={280}
            radius="md"
            fallbackSrc="https://via.placeholder.com/280x280?text=Sin+Imagen"
          />
          <Stack>
            <Title order={2}>{product.name}</Title>
            <Text size="lg" c="dimmed">
              {product.brand}
            </Text>
            <Text size="sm" c="gray">
              Código: {product.code}
            </Text>
            <Text size="md" mt="md">
              Categoría: <b>{product.group || "Sin categoría"}</b>
            </Text>
            {product.datasheet && (
              <Button
                variant="subtle"
                component="a"
                href={product.datasheet}
                target="_blank"
                rel="noopener noreferrer"
                mt="md"
              >
                Ver ficha técnica ↗
              </Button>
            )}
            <Button color="dark" radius="md" mt="lg">
              Agregar al carrito
            </Button>
          </Stack>
        </Group>
      </Card>

      {/* Compatibles */}
      <Title order={4} mt="lg" mb="xs">
        Productos compatibles
      </Title>
      {loadingCompatibles ? (
        <Loader />
      ) : compatibles.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
          {compatibles.map((comp) => (
            <Card
              key={comp.code}
              withBorder
              radius="md"
              style={{ background: "#fafafa" }}
            >
              <Card.Section>
                <Image
                  src={comp.image || ""}
                  alt={comp.name || "Compatible"}
                  height={120}
                  fallbackSrc="https://via.placeholder.com/200x120?text=Sin+Imagen"
                  style={{ objectFit: "cover" }}
                />
              </Card.Section>
              <Stack align="center" gap={0} py="sm">
                <Text size="md" fw={500}>
                  {comp.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {comp.code}
                </Text>
              </Stack>
              <Button
                variant="light"
                fullWidth
                size="xs"
                radius="md"
                mt="sm"
                onClick={() => navigate(`/product/${comp.code}`)}
              >
                Ver detalle
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text c="dimmed" mt="sm">
          No hay productos compatibles registrados.
        </Text>
      )}
    </Stack>
  );
}
