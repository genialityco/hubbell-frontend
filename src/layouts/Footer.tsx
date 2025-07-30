import { useEffect, useState } from "react";
import { Container, Group, Text } from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandTiktok,
} from "@tabler/icons-react";
import footerDesktop from "../assets/footer-desktop.png";
import footerMobile from "../assets/footer-mobile.png";

export default function Footer() {
  const [bg, setBg] = useState(footerDesktop);

  useEffect(() => {
    const onResize = () => {
      setBg(window.innerWidth <= 768 ? footerMobile : footerDesktop);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <footer
      style={{
        background: `url(${bg}) center/cover no-repeat #111`,
        padding: "32px 0 24px 0",
        marginTop: 48,
        minHeight: 140, // puedes ajustar esto
        borderTop: "1px solid #232323",
      }}
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
          <Text c="gray.2" size="sm" style={{ marginTop: 8 }}>
            © {new Date().getFullYear()} Hubbell. Todos los derechos reservados.
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
