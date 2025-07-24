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
} from "@mantine/core";
import type { Product } from "../types/Product";
import { searchProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";
import ProductSearchHero from "../components/ProductSearchHero"; // importa el componente ajustado
import CustomLoader from "../components/CustomLoader";

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Cargar todo al inicio
  useEffect(() => {
    searchProducts("", []).then((data) => {
      setProducts(data.products); // productos visibles/filtrados
      setAllProducts(data.products); // todos los productos base
      setLoading(false);

      const types = Array.from(
        new Set(data.products.map((prod: Product) => prod.type || "Sin tipo"))
      );
      setCategoryOptions(types);
      setSelectedCategories(types);
    });
  }, []);

  // Este useEffect va después de la declaración de setSearch y selectedCategories
  useEffect(() => {
    if (search === "") {
      // Si tienes todas las categorías seleccionadas, muestra todos los productos base
      // Si hay filtros por categorías activos, filtra allProducts por esas categorías
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

  // Cuando seleccionan/desclican una categoría
  const handleCategoryChange = (cat: string, checked: boolean) => {
    const newCats = checked
      ? [...selectedCategories, cat]
      : selectedCategories.filter((c) => c !== cat);
    setSelectedCategories(newCats);
    doSearch(search, newCats);
  };

  // Integración con buscador inteligente
  const handleSuggestion = (s: string) => {
    setSearch(s);
    doSearch(s, selectedCategories);
  };

  const handleProductRecommendation = (prod: Product) => {
    setSearch(prod.name || "");
    doSearch(prod.name || "", selectedCategories);
    // O navegar directo:
    // navigate(`/product/${encodeURIComponent(prod.code)}`)
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
        <Group align="flex-start" gap={32}>
          {/* Sidebar checklist */}
          <Box
            w={290}
            bg="#fff"
            p="xl"
            mih={420}
            bdrs={18}
            bd={"1px solid gray"}
          >
            <Group justify="space-between" mb={8}>
              <Text fw={700} size="lg">
                Tipo de producto
              </Text>
            </Group>
            <Divider my="sm" />
            <ScrollArea.Autosize mah={360} type="scroll">
              <Stack>
                {categoryOptions.map((cat) => {
                  // Este contador siempre es según el resultado ACTUAL (búsqueda+categoría)
                  const filteredCount = products.filter(
                    (prod) => (prod.type || "Sin tipo") === cat
                  ).length;

                  return (
                    <Checkbox
                      key={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={(e) =>
                        handleCategoryChange(cat, e.currentTarget.checked)
                      }
                      color="rgba(0, 0, 0, 1)"
                      size="xs"
                      label={
                        <Flex>
                          <Text size="sm">{cat}</Text>
                          <Text size="sm" c="dimmed" ml={8}>
                            {filteredCount}
                          </Text>
                        </Flex>
                      }
                      mb={4}
                    />
                  );
                })}
              </Stack>
            </ScrollArea.Autosize>
          </Box>

          {/* Grilla de productos */}
          <Box flex={1} w="100%" mih={620}>
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
                  <Card.Section style={{ position: "relative", margin: "5px" }}>
                    <Image
                      src={prod.image || ""}
                      alt={prod.name || "Producto"}
                      height={120}
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
        </Group>
      </Container>
    </Box>
  );
}
