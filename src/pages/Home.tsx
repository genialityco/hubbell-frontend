import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Stack,
  Text,
  SimpleGrid,
  Card,
  Image,
  Group,
  ScrollArea,
  Flex,
  rem,
  Container,
  Divider,
  Button,
  Menu,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { Product } from "../types/Product";
import { searchProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";
import ProductSearchHero from "../components/ProductSearchHero";
import CustomLoader from "../components/CustomLoader";
import { IconFilter } from "@tabler/icons-react";

type CategoryFilterProps = {
  categoryOptions: string[];
  products: Product[];
  selectedCategories: string[];
  onChange: (cats: string[]) => void;
};

// Sidebar desktop/tablet
function CategorySidebarFilter({
  categoryOptions,
  products,
  selectedCategories,
  onChange,
}: CategoryFilterProps) {
  return (
    <Box
      w={290}
      bg="#fff"
      p="xl"
      mih={420}
      bdrs={18}
      bd={"1px solid gray"}
      mb={{ base: 24, md: 0 }}
    >
      <Text fw={700} size="lg" mb="sm">
        Tipo de producto
      </Text>
      <Divider my="sm" />
      <ScrollArea.Autosize mah={360} type="scroll">
        <Stack>
          {categoryOptions.map((cat) => {
            const filteredCount = products.filter(
              (prod) => (prod.type || "Sin tipo") === cat
            ).length;
            return (
              <Checkbox
                key={cat}
                label={
                  <Group gap={6}>
                    <Text size="sm">{cat}</Text>
                    <Text size="xs" c="dimmed">
                      ({filteredCount})
                    </Text>
                  </Group>
                }
                checked={selectedCategories.includes(cat)}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  if (checked) {
                    onChange([...selectedCategories, cat]);
                  } else {
                    onChange(selectedCategories.filter((c) => c !== cat));
                  }
                }}
                mb={2}
                size="sm"
              />
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
      <Group gap={8} mt="lg">
        <Button
          variant="default"
          color="gray"
          size="xs"
          onClick={() => onChange(categoryOptions)}
        >
          Seleccionar todos
        </Button>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          onClick={() => onChange([])}
        >
          Limpiar filtros
        </Button>
      </Group>
    </Box>
  );
}

// Filtro menú mobile
function CategoryMenuFilter({
  categoryOptions,
  products,
  selectedCategories,
  onChange,
}: CategoryFilterProps) {
  return (
    <Menu
      shadow="md"
      width={260}
      position="bottom-start"
      closeOnItemClick={false}
      withinPortal
    >
      <Menu.Target>
        <Button
          variant="light"
          leftSection={<IconFilter size={18} />}
          color="dark"
          size="md"
        >
          Filtrar tipo de producto
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Stack gap={2} p="sm">
          {categoryOptions.map((cat) => {
            const filteredCount = products.filter(
              (prod) => (prod.type || "Sin tipo") === cat
            ).length;
            return (
              <Checkbox
                key={cat}
                label={
                  <Group gap={6}>
                    <Text size="sm">{cat}</Text>
                    <Text size="xs" c="dimmed">
                      ({filteredCount})
                    </Text>
                  </Group>
                }
                checked={selectedCategories.includes(cat)}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  if (checked) {
                    onChange([...selectedCategories, cat]);
                  } else {
                    onChange(selectedCategories.filter((c) => c !== cat));
                  }
                }}
                mb={2}
                size="sm"
              />
            );
          })}
        </Stack>
        <Button
          variant="default"
          color="gray"
          fullWidth
          size="xs"
          mt="xs"
          onClick={() => onChange(categoryOptions)}
        >
          Seleccionar todos
        </Button>
        <Button
          variant="subtle"
          color="gray"
          fullWidth
          size="xs"
          mt={4}
          onClick={() => onChange([])}
        >
          Limpiar filtros
        </Button>
      </Menu.Dropdown>
    </Menu>
  );
}

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 48em)");

  // Cargar todo al inicio
  useEffect(() => {
    searchProducts("", []).then((data) => {
      setProducts(data.products);
      setAllProducts(data.products);
      setLoading(false);

      const types = Array.from(
        new Set(data.products.map((prod: Product) => prod.type || "Sin tipo"))
      );
      setCategoryOptions(types);
      setSelectedCategories(types);
    });
  }, []);

  useEffect(() => {
    if (search === "") {
      const filtered = allProducts.filter((prod) =>
        selectedCategories.includes(prod.type || "Sin tipo")
      );
      setProducts(filtered);
    }
  }, [search, selectedCategories, allProducts]);

  // Buscar productos en backend
  const doSearch = async (q = search, cats = selectedCategories) => {
    setLoading(true);
    const data = await searchProducts(q, cats);
    setProducts(data.products);
    setLoading(false);
  };

  const handleSuggestion = (s: string) => {
    setSearch(s);
    doSearch(s, selectedCategories);
  };

  const handleProductRecommendation = (prod: Product) => {
    setSearch(prod.name || "");
    doSearch(prod.name || "", selectedCategories);
  };

  if (loading) return <CustomLoader />;

  return (
    <Box>
      {/* Buscador inteligente */}
      <ProductSearchHero
        products={products}
        search={search}
        setSearch={setSearch}
        onSelectSuggestion={handleSuggestion}
        onSelectProduct={handleProductRecommendation}
        onEnter={() => doSearch()}
        loading={loading}
      />

      <Container size="xl" pt={rem(32)} pb={rem(40)}>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={32}
          align="start"
          w="100%"
        >
          {/* Filtro lateral solo desktop/tablet */}
          {!isMobile && (
            <CategorySidebarFilter
              categoryOptions={categoryOptions}
              products={products}
              selectedCategories={selectedCategories}
              onChange={(cats: string[]) => {
                setSelectedCategories(cats);
                doSearch(search, cats);
              }}
            />
          )}

          <Box flex={1} w="100%">
            {/* Filtro menú solo móvil */}
            {isMobile && (
              <Group justify="start" mb="lg">
                <CategoryMenuFilter
                  categoryOptions={categoryOptions}
                  products={products}
                  selectedCategories={selectedCategories}
                  onChange={(cats: string[]) => {
                    setSelectedCategories(cats);
                    doSearch(search, cats);
                  }}
                />
              </Group>
            )}

            {/* Grilla de productos */}
            <Box mih={620}>
              <Text fw={700} size="xl" mb={2}>
                Todos nuestros productos
              </Text>
              <Text c="dimmed" size="sm" mb="lg">
                ({products.length} resultados)
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                {products.map((prod) => (
                  <Card
                    key={prod.code}
                    withBorder
                    radius="lg"
                    style={{
                      background: "#f6f6f6",
                      minHeight: 230,
                      position: "relative",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                    onClick={() =>
                      navigate(`/product/${encodeURIComponent(prod.code)}`)
                    }
                  >
                    <Card.Section
                      style={{ position: "relative", margin: "5px" }}
                    >
                      <Image
                        src={prod.image || ""}
                        alt={prod.name || "Producto"}
                        height="auto"
                        fit="contain"
                        fallbackSrc="https://via.placeholder.com/180x120?text=Sin+Imagen"
                        style={{ objectFit: "cover", borderRadius: "10px" }}
                      />
                    </Card.Section>
                    <Stack align="center" gap={0} mt="md">
                      <Text size="lg" fw={600}>
                        {prod.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {prod.code}
                      </Text>
                    </Stack>
                    <Button size="xs" bg="black" bdrs="lg" my="sm">
                      Agregar al carrito (TBD)
                    </Button>
                    {prod.datasheet && (
                      <Text
                        component="a"
                        href={prod.datasheet}
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
                ))}
              </SimpleGrid>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
