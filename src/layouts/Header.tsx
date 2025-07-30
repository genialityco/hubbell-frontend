import { useEffect, useState } from "react";
import { Container, Group, rem } from "@mantine/core";
import logo from "../assets/logo.png";
import headerDesktop from "../assets/header-desktop.png";
import headerMobile from "../assets/header-mobile.png";
// import { IconHeart, IconShoppingCart } from "@tabler/icons-react";

export default function Header() {
  const [bg, setBg] = useState(headerDesktop);

  useEffect(() => {
    const onResize = () => {
      setBg(window.innerWidth <= 768 ? headerMobile : headerDesktop);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      style={{
        background: `url(${bg}) center/cover no-repeat`,
        minHeight: 80,
        borderBottom: "1px solid #eee",
      }}
    >
      <Container size="xl" h={80} py={0} px={rem(0)} fluid>
        <Group justify="space-between" align="center" h="100%" px="lg">
          <img src={logo} alt="Logo Hubbell" width={110} />
          {/* <Group gap="xs">
            <IconHeart size={26} style={{ cursor: "pointer" }} />
            <IconShoppingCart size={26} style={{ cursor: "pointer" }} />
          </Group> */}
        </Group>
      </Container>
    </header>
  );
}
