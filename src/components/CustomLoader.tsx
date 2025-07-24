import { Center, Loader, Text, Stack, Image } from "@mantine/core";

interface CustomLoaderProps {
  logoUrl?: string;        // Si quieres pasar logo por prop, sino usa import
  text?: string;           // Texto opcional ("Cargando...", etc)
  size?: number | "sm" | "md" | "lg" | "xl";
}

export default function CustomLoader({
  logoUrl = "/logo.png",   // Ajusta ruta según tu estructura
  text = "Cargando...",
  size = "lg",
}: CustomLoaderProps) {
  return (
    <Center style={{
      minHeight: '60vh',
      flexDirection: "column",
      background: "transparent",  // puedes poner fondo si quieres overlay
    }}>
      <Stack align="center" gap="xs">
        <Image
          src={logoUrl}
          width={84}
          height={84}
          fit="contain"
          alt="Logo"
          style={{
            marginBottom: 10,
            filter: "drop-shadow(0 0 8px #eee)",
          }}
        />
        <Loader size={size} color="black" />
        <Text size="lg" c="dimmed">{text}</Text>
      </Stack>
    </Center>
  );
}
