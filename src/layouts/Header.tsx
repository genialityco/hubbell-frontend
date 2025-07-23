// src/components/Header.tsx
import { Container, Group, rem } from "@mantine/core";
import { IconHeart, IconShoppingCart } from "@tabler/icons-react";
import logo from "../assets/logo.png"; // Cambia esta ruta por la real de tu logo

export default function Header() {
  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
      <Container size="xl" h={80} py={0} px={rem(0)} fluid>
        <Group justify="space-between" align="center" h="100%" px="lg">
          {/* Logo */}
          <img src={logo} alt="Logo Hubbell" width={110} />

          {/* Íconos de usuario */}
          <Group gap="xs">
            <IconHeart size={26} style={{ cursor: "pointer" }} />
            <IconShoppingCart size={26} style={{ cursor: "pointer" }} />
          </Group>
        </Group>
      </Container>
    </header>
  );
}
