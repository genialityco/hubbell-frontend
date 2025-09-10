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
  Loader,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import type { Product } from "../types/Product";

// Helper para resaltar coincidencias
function highlightBold(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`,
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
  loading?: boolean; // 👈 loader de búsqueda
  onClear?: () => void;
  matchedProduct?: Product | null;
  compatibleProducts?: Product[];
}

export default function ProductSearchHero({
  products,
  search,
  setSearch,
  onSelectSuggestion,
  onSelectProduct,
  onEnter,
  loading = false,
  onClear,
  matchedProduct,
  compatibleProducts = [],
}: ProductSearchHeroProps) {
  const [shouldShowPanel, setShouldShowPanel] = useState(false);
  const [, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 48em)");

  function handleFocus() {
    setFocused(true);
    setShouldShowPanel(true);
  }

  function handleBlur() {
    setTimeout(() => {
      setShouldShowPanel(false);
      setFocused(false);
    }, 160);
  }

  // Sugerencias
  const suggestions = Array.from(
    new Set(products.flatMap((prod) => [prod.name, prod.group]).filter(Boolean))
  )
    .filter((s) =>
      search.length > 0 ? s!.toLowerCase().includes(search.toLowerCase()) : true
    )
    .slice(0, 8);

  const showCompatibles =
    !!matchedProduct &&
    compatibleProducts &&
    compatibleProducts.length > 0 &&
    matchedProduct.code.toLowerCase() === search.trim().toLowerCase();

  // Recomendaciones
  const recommendations = products
    .filter((prod) =>
      search.length > 0
        ? prod.name?.toLowerCase().includes(search.toLowerCase()) ||
          prod.code?.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .slice(0, 4);

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
      py={isMobile ? 16 : 20}
      px={isMobile ? 6 : 0}
      style={{
        minHeight:
          search.length === 0 ? (isMobile ? 210 : 210) : isMobile ? 90 : 120,
        borderBottom: "1px solid #e4e4e4",
        textAlign: "center",
        position: "relative",
        transition: "min-height 0.2s",
      }}
    >
      {/* Textos solo si NO hay búsqueda */}
      {search.length === 0 && (
        <>
          <Text
            fw={700}
            style={{ fontSize: isMobile ? "20px" : "24px", lineHeight: 1.1 }}
          >
            Búsqueda de producto
          </Text>
          <Text
            size={isMobile ? "md" : "lg"}
            mt="md"
            mb={isMobile ? 18 : 40}
            c="dimmed"
          >
            Escribe el nombre o referencia del producto,
            {isMobile ? <br /> : " "}o sube una imagen para ver productos
            compatibles disponibles.
          </Text>
        </>
      )}

      {/* Input */}
      <Group justify="center" mx="auto" maw={isMobile ? "100%" : 520} w="100%">
        <Input
          ref={inputRef}
          leftSection={<IconSearch size={22} />}
          rightSection={
            <Group gap={6}>
              {loading && <Loader size="sm" />}
              <CloseButton
                aria-label="Clear input"
                onClick={() => {
                  setSearch("");
                  setShouldShowPanel(true);
                  onClear?.();
                }}
                style={{ display: search ? undefined : "none" }}
              />
            </Group>
          }
          rightSectionPointerEvents="all"
          radius="md"
          size={isMobile ? "md" : "lg"}
          placeholder="Escribe aquí nombre o referencia del producto"
          bg="#eaf6fb"
          value={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            setShouldShowPanel(true); // mantener panel visible mientras escribe
            if (val === "") onClear?.();
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              onEnter();
              setShouldShowPanel(true); // no ocultar el panel al Enter
            }
          }}
          // No deshabilitar el input durante búsqueda: permite seguir escribiendo
          style={{ flex: 1, minWidth: 0, fontSize: isMobile ? 15 : 18 }}
        />
      </Group>

      {shouldShowPanel && (
        <Box
          ref={ref}
          pos="absolute"
          left="50%"
          top={
            search.length === 0 ? (isMobile ? 190 : 190) : isMobile ? 60 : 75
          }
          style={{
            transform: "translateX(-50%)",
            width: isMobile ? "92vw" : 730,
            zIndex: 20,
            maxWidth: isMobile ? "98vw" : 900,
            transition: "top 0.18s",
          }}
        >
          <Paper
            p={isMobile ? "md" : "xl"}
            radius="lg"
            shadow="xl"
            style={{
              background: "#fff",
              border: "1.5px solid #ededed",
              display: isMobile ? "block" : "flex",
              alignItems: isMobile ? "stretch" : "start",
              gap: isMobile ? 18 : 32,
              fontSize: isMobile ? 15 : 16,
            }}
          >
            {/* Compatibles */}
            {showCompatibles && (
              <Box style={{ width: "100%" }}>
                <Text size={isMobile ? "sm" : "md"} fw={600} mb={10}>
                  Compatibles con {matchedProduct!.code}
                </Text>
                <Stack gap={8} mb={isMobile ? 12 : 16}>
                  {compatibleProducts.slice(0, 6).map((prod) => (
                    <Paper
                      key={`compat-${prod.code}`}
                      radius={10}
                      shadow="xs"
                      p={0}
                      style={{
                        background: "#fffef7",
                        marginBottom: 8,
                        cursor: "pointer",
                        border: "1.5px solid #ffe08a",
                        width: "100%",
                        minHeight: isMobile ? 56 : 72,
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                      }}
                      onMouseDown={() => {
                        onSelectProduct?.(prod);
                        setShouldShowPanel(false);
                      }}
                    >
                      <Image
                        src={prod.image || ""}
                        w={isMobile ? 56 : 72}
                        h={isMobile ? 56 : 72}
                        radius="md"
                        fit="cover"
                        alt={prod.name}
                        fallbackSrc="https://via.placeholder.com/62x62?text=Img"
                        m="xs"
                      />
                      <Flex
                        direction="column"
                        align="start"
                        style={{ paddingRight: 8 }}
                      >
                        <Text fw={700} size={isMobile ? "sm" : "md"} lh={1.1}>
                          {prod.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Código: {prod.code}
                        </Text>
                      </Flex>
                    </Paper>
                  ))}
                </Stack>
                <Divider my={isMobile ? 8 : 12} />
              </Box>
            )}

            {/* Sugerencias */}
            <Stack gap={isMobile ? 2 : 3} mb={isMobile ? 20 : 0}>
              <Flex align="start" direction="column">
                <Text size={isMobile ? "sm" : "md"} fw={400} mb={10}>
                  Sugerencias de búsqueda
                </Text>
                {suggestions.length === 0 ? (
                  <Text c="dimmed" size="sm">
                    Sin sugerencias
                  </Text>
                ) : (
                  suggestions.map((sug) => (
                    <Text
                      fw={400}
                      size={isMobile ? "md" : "lg"}
                      my="xs"
                      key={sug}
                      component="span"
                      style={{
                        cursor: "pointer",
                        borderRadius: 7,
                        paddingLeft: 5,
                        paddingRight: 5,
                        transition: "background 0.15s",
                        fontSize: isMobile ? 15 : 17,
                      }}
                      onMouseDown={() => {
                        setSearch(sug!);
                        onSelectSuggestion?.(sug!);
                        setShouldShowPanel(false);
                      }}
                    >
                      {highlightBold(sug!, search)}
                    </Text>
                  ))
                )}
              </Flex>
            </Stack>

            <Divider
              orientation={isMobile ? "horizontal" : "vertical"}
              mx={isMobile ? 0 : 8}
              my={isMobile ? 8 : 0}
            />

            {/* Recomendaciones */}
            <Box style={{ flex: 1.1 }}>
              <Stack gap={isMobile ? 4 : 7}>
                <Flex align="start" direction="column">
                  <Text size={isMobile ? "sm" : "md"} fw={400} mb={10}>
                    Recomendaciones de productos
                  </Text>
                  {recommendations.length === 0 ? (
                    <Text c="dimmed" size="sm">
                      Sin resultados
                    </Text>
                  ) : (
                    recommendations.map((prod) => (
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
                          minHeight: isMobile ? 60 : 84,
                          display: "flex",
                          alignItems: "center",
                          gap: 0,
                        }}
                        onMouseDown={() => {
                          onSelectProduct?.(prod);
                          setShouldShowPanel(false);
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.boxShadow =
                            "0 0 0 2px #ffd43b")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.boxShadow = "0 1px 4px 0 #eee")
                        }
                      >
                        <Image
                          src={prod.image || ""}
                          w={isMobile ? 60 : 80}
                          h={isMobile ? 60 : 80}
                          radius="md"
                          fit="cover"
                          alt={prod.name}
                          fallbackSrc="https://via.placeholder.com/62x62?text=Img"
                          m="xs"
                        />
                        <Flex direction="column" align="start">
                          <Text
                            fw={700}
                            size={isMobile ? "sm" : "md"}
                            lh={1.1}
                            style={{ fontSize: isMobile ? 15 : 18 }}
                          >
                            {prod.name}
                          </Text>
                          <Text size="sm" c="dimmed">
                            Código: {prod.code}
                          </Text>
                        </Flex>
                      </Paper>
                    ))
                  )}
                </Flex>
              </Stack>
            </Box>
          </Paper>
        </Box>
      )}
    </Paper>
  );
}
