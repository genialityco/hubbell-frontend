import { Container, Group, Text } from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandTiktok,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer
      style={{ background: "#111", padding: "32px 0 24px 0", marginTop: 48 }}
    >
      <Container size="xl">
        <Group
          justify="space-between"
          align="center"
          style={{ flexWrap: "wrap" }}
        >
          <Group gap="md">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandInstagram
                color="white"
                size={28}
                style={{ opacity: 0.85 }}
              />
            </a>
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandFacebook
                color="white"
                size={28}
                style={{ opacity: 0.85 }}
              />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandTwitter
                color="white"
                size={28}
                style={{ opacity: 0.85 }}
              />
            </a>
            <a
              href="https://tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandTiktok
                color="white"
                size={28}
                style={{ opacity: 0.85 }}
              />
            </a>
          </Group>
          <Text c="gray.2" size="sm">
            © {new Date().getFullYear()} Hubbell. Todos los derechos reservados.
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
