import { Card, Image, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types/Product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      withBorder
      radius="lg"
      shadow="none"
      onClick={() => navigate(`/product/${encodeURIComponent(product.code)}`)}
      style={{
        background: "#f6f6f6",
        cursor: "pointer",
        minHeight: 230,
        border: "2px solid #f1f3f6",
        transition: "box-shadow 0.25s, border 0.25s",
      }}
      className="product-card"
    >
      <Card.Section style={{ margin: "5px" }}>
        <Image
          src={product.image || ""}
          alt={product.name || "Producto"}
          fit="contain"
          fallbackSrc="https://via.placeholder.com/180x120?text=Sin+Imagen"
          style={{
            objectFit: "cover",
            borderRadius: 10,
            background: "#fff",
          }}
        />
      </Card.Section>

      <Stack align="center" gap={0} mt="md">
        <Text size="sm" c="dimmed">
          {product.type}
        </Text>
        <Text size="lg" fw={600}>
          {product.name}
        </Text>
        <Text size="sm" c="dimmed">
          {product.code}
        </Text>
      </Stack>

      {product.datasheet && (
        <Text
          component="a"
          href={product.datasheet}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          mt="xs"
          c="dark"
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
  );
}
