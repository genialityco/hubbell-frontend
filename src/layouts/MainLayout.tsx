// src/layouts/MainLayout.tsx
import {
  AppShell,
  Container,
  Group,
  Image,
  Text,
  Input,
  Box,
  Stack,
  Flex,
  rem,
} from "@mantine/core";
import {
  IconSearch,
  IconHeart,
  IconShoppingCart,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
} from "@tabler/icons-react";
import logo from "../assets/logo.avif";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      header={{
        height: 80,
      }}
      navbar={{
        width: 260,
        breakpoint: "sm",
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%" py={0} px={rem(0)} fluid>
          <Group justify="space-between" align="center" h="100%">
            <Group>
              <Image src={logo} alt="Logo Hubbell" width={50} />
            </Group>
            <Box style={{ flex: 1, maxWidth: 520 }}>
              <Input
                leftSection={<IconSearch size={20} />}
                placeholder="Escribe aquí nombre o referencia del producto"
                size="md"
                radius="xl"
              />
            </Box>
            <Group gap="xs">
              <IconHeart size={26} style={{ cursor: "pointer" }} />
              <IconShoppingCart size={26} style={{ cursor: "pointer" }} />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar>
        {/* Sidebar de filtros */}
        <Box p="lg">
          <Text fw={700} mb="sm" size="lg">
            Tipo de producto
          </Text>
          {/* Aquí van los filtros, por ejemplo, con checkboxes */}
          {/* Sustituye esto por tus datos reales */}
          <Stack gap="xs">
            <Input placeholder="Buscar" />
            <Stack gap={4}>
              <label>
                <input type="checkbox" checked readOnly /> Conector mecánico
              </label>
              <label>
                <input type="checkbox" checked readOnly /> Conector a superficie
                plana
              </label>
              {/* ...etc */}
            </Stack>
          </Stack>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg="#f7f7f7">
        <Container size="xl" py="md">
          {children}
        </Container>
      </AppShell.Main>

      <AppShell.Footer bg="white" py="md">
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} Hubbell. Todos los derechos
              reservados.
            </Text>
            <Group gap="md">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandInstagram size={24} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandFacebook size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandLinkedin size={24} />
              </a>
            </Group>
          </Flex>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}
