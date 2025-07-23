// src/pages/Cart.tsx
import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Group,
  Image,
  Text,
  Stack,
  NumberInput,
} from "@mantine/core";
import type { Product } from "../types/Product";

interface CartItem extends Product {
  quantity: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const updateQuantity = (code: string, newQty: number) => {
    const newCart = cart
      .map((item) =>
        item.code === code ? { ...item, quantity: newQty } : item
      )
      .filter((item) => item.quantity > 0);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeFromCart = (code: string) => {
    const newCart = cart.filter((item) => item.code !== code);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  if (cart.length === 0) return <Text m="md">El carrito está vacío.</Text>;

  return (
    <Stack>
      {cart.map((item) => (
        <Card key={item.code} withBorder shadow="sm">
          <Group justify="space-between">
            <Group>
              <Image
                src={item.image || ""}
                width={70}
                alt={item.name || "Producto"}
                fallbackSrc="https://via.placeholder.com/70x70?text=Sin+Imagen"
              />
              <div>
                <Text fw={600}>{item.name}</Text>
                <Text size="sm">
                  ${item.price?.toLocaleString() ?? "0"} x {item.quantity}
                </Text>
              </div>
            </Group>
            <Group>
              <NumberInput
                value={item.quantity}
                min={1}
                max={item.stock || 1000}
                style={{ width: 80 }}
                onChange={(val) => updateQuantity(item.code, Number(val))}
              />
              <Button color="red" onClick={() => removeFromCart(item.code)}>
                Quitar
              </Button>
            </Group>
          </Group>
        </Card>
      ))}
      <Card withBorder>
        <Group justify="space-between">
          <Text fw={700}>Total:</Text>
          <Text fw={700}>${total.toLocaleString()}</Text>
        </Group>
        <Button fullWidth mt="md" disabled>
          Finalizar compra (próximamente)
        </Button>
      </Card>
    </Stack>
  );
}
