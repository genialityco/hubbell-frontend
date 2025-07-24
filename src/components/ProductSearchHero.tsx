import {
  Input,
  Group,
  Text,
  Paper,
  Box,
  Image,
  Stack,
  Divider,
  Flex,
  CloseButton,
} from "@mantine/core";
import { IconSearch, IconCameraPlus } from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import type { Product } from "../types/Product";

// Helper para resaltar coincidencias
function highlightBold(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ fontWeight: 700, color: "#222" }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface ProductSearchHeroProps {
  products: Product[];
  search: string;
  setSearch: (v: string) => void;
  onSelectSuggestion?: (s: string) => void;
  onSelectProduct?: (product: Product) => void;
  onEnter?: () => void;
  loading?: boolean;
}

export default function ProductSearchHero({
  products,
  search,
  setSearch,
  onSelectSuggestion,
  onSelectProduct,
  onEnter,
  loading = false,
}: ProductSearchHeroProps) {
  const [shouldShowPanel, setShouldShowPanel] = useState(false);
  const [, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    setFocused(true);
    setShouldShowPanel(true);
  }

  function handleBlur() {
    setTimeout(() => {
      setShouldShowPanel(false);
      setFocused(false);
    }, 120); // permite click en sugerencia
  }

  // Sugerencias únicas, ejemplo con nombre y grupo
  const suggestions = Array.from(
    new Set(
      products
        .flatMap((prod) => [
          ...(prod.name ? [prod.name] : []),
          ...(prod.group ? [prod.group] : []),
        ])
        .filter(Boolean)
    )
  ).filter((s) =>
    search.length > 0 ? s.toLowerCase().includes(search.toLowerCase()) : false
  );

  // Productos recomendados actuales
  const recommendations = products.filter(
    (prod) =>
      search.length > 0 &&
      (prod.name?.toLowerCase().includes(search.toLowerCase()) ||
        prod.code?.toLowerCase().includes(search.toLowerCase()))
  );

  // Panel: cerrar si click fuera
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShouldShowPanel(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <Paper
      radius={0}
      bg="#ededed"
      py={20}
      px={0}
      style={{
        minHeight: 280,
        borderBottom: "1px solid #e4e4e4",
        textAlign: "center",
        position: "relative",
      }}
    >
      <Text fw={700} style={{ fontFamily: "inherit", fontSize: "24px" }}>
        Búsqueda de producto
      </Text>
      <Text size="lg" mt="md" mb={40} c="dimmed">
        Escribe el nombre o referencia del producto, o sube una imagen para ver
        productos compatibles disponibles.
      </Text>
      <Group justify="center" mx="auto" maw={520}>
        <Input
          ref={inputRef}
          leftSection={<IconSearch size={22} />}
          rightSection={
            <>
              <CloseButton
                aria-label="Clear input"
                onClick={() => {
                  setSearch("");
                  setShouldShowPanel(false); // opcional: cierra panel de sugerencias al limpiar
                }}
                style={{ display: search ? undefined : "none" }}
              />
              {!search && (
                <IconCameraPlus
                  size={22}
                  style={{ cursor: "pointer", marginLeft: 4 }}
                />
              )}
            </>
          }
          rightSectionPointerEvents="all"
          radius="md"
          size="lg"
          placeholder="Escribe aquí nombre o referencia del producto"
          bg="#eaf6fb"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              onEnter();
              setShouldShowPanel(false); // opcional
            }
          }}
          disabled={loading}
        />
      </Group>

      {shouldShowPanel && search.length > 0 && (
        <Box
          ref={ref}
          pos="absolute"
          left="50%"
          top={200}
          style={{
            transform: "translateX(-50%)",
            width: 730,
            zIndex: 20,
          }}
        >
          <Paper
            p="xl"
            radius="lg"
            shadow="xl"
            style={{
              background: "#fff",
              border: "1.5px solid #ededed",
              display: "flex",
              alignItems: "start",
              gap: 32,
            }}
          >
            {/* Sugerencias */}
            <Stack gap={3}>
              <Flex align="start" direction="column">
                <Text size="md" fw={400} mb={12}>
                  Sugerencias de búsqueda
                </Text>
                {suggestions.length === 0 && (
                  <Text c="dimmed" size="sm">
                    Sin sugerencias
                  </Text>
                )}
                {suggestions.slice(0, 8).map((sug) => (
                  <Text
                    fw={400}
                    size="lg"
                    my="xs"
                    key={sug}
                    component="span"
                    style={{
                      cursor: "pointer",
                      borderRadius: 7,
                      px: 5,
                      transition: "background 0.15s",
                    }}
                    onMouseDown={() => {
                      setSearch(sug);
                      onSelectSuggestion?.(sug);
                      setShouldShowPanel(false);
                    }}
                  >
                    {highlightBold(sug, search)}
                  </Text>
                ))}
              </Flex>
            </Stack>
            <Divider orientation="vertical" mx={0} />
            {/* Recomendaciones de producto */}
            <Box style={{ flex: 1.1 }}>
              <Stack gap={7}>
                <Flex align="start" direction="column">
                  <Text size="md" fw={400} mb={12}>
                    Recomendaciones de productos
                  </Text>
                  {recommendations.length === 0 && (
                    <Text c="dimmed" size="sm">
                      Sin resultados
                    </Text>
                  )}
                  {recommendations.slice(0, 4).map((prod) => (
                    <Paper
                      key={prod.code}
                      radius={10}
                      shadow="xs"
                      p={0}
                      style={{
                        background: "#fafafa",
                        marginBottom: 12,
                        cursor: "pointer",
                        border: "1.5px solid #f2f2f2",
                        width: "100%",
                        minHeight: 84,
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                      }}
                      onMouseDown={() => {
                        onSelectProduct?.(prod);
                        setShouldShowPanel(false);
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.boxShadow = "0 0 0 2px #ffd43b")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.boxShadow = "0 1px 4px 0 #eee")
                      }
                    >
                      <Image
                        src={prod.image || ""}
                        w={80}
                        h={80}
                        radius="md"
                        fit="cover"
                        alt={prod.name}
                        fallbackSrc="https://via.placeholder.com/62x62?text=Img"
                        m="xs"
                      />
                      <Flex direction="column" align="start">
                        <Text
                          fw={700}
                          size="md"
                          lh={1.1}
                          style={{ fontSize: 18 }}
                        >
                          {prod.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Código: {prod.code}
                        </Text>
                      </Flex>
                    </Paper>
                  ))}
                </Flex>
              </Stack>
            </Box>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}
