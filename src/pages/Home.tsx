import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  Stack,
  Text,
  SimpleGrid,
  Card,
  Image,
  Button,
  Group,
  Input,
  ScrollArea,
  Loader,
  Flex,
  rem,
  Container,
} from "@mantine/core";
import type { Product } from "../types/Product";
import ProductSearchHero from "../components/ProductSearchHero";
import { fetchProducts } from "../services/productService";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compatibles, setCompatibles] = useState<Product[]>([]);
  const [loadingCompatibles, setLoadingCompatibles] = useState(false);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data.products);
      setLoading(false);

      // Agrupa por type, no group
      const types = Array.from(
        new Set(data.products.map((prod: Product) => prod.type || "Sin tipo"))
      );
      console.log(types);
      setCategoryOptions(types);
      setSelectedCategories(types); // Todos seleccionados por defecto
    });
  }, []);

  // Filtra productos según checklist y búsqueda
const filteredProducts = useMemo(() => {
  // Si no hay categorías seleccionadas, no mostramos nada
  if (selectedCategories.length === 0) return [];

  return products.filter((prod) => {
    const type = prod.type || "Sin tipo";
    const matchesCategory = selectedCategories.includes(type);

    // Si el producto no tiene type válido, no mostrarlo
    if (!type || type === "Sin tipo") return false;

    const matchesSearch =
      prod.name?.toLowerCase().includes(search.toLowerCase()) ||
      prod.code?.toLowerCase().includes(search.toLowerCase()) ||
      prod.brand?.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && (!search || matchesSearch);
  });
}, [products, selectedCategories, search]);


  // Selecciona producto y filtra compatibles
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (product.compatibles && product.compatibles.length > 0) {
      setLoadingCompatibles(true);

      // OBTÉN LOS CÓDIGOS DE LOS COMPATIBLES
    const compatiblesCodes = product.compatibles; // ya es string[]

      // FILTRA LOS PRODUCTOS QUE COINCIDEN CON ALGÚN CÓDIGO
      const compatiblesList = products.filter((p) =>
        compatiblesCodes.includes(p.code)
      );
      setCompatibles(compatiblesList);
      setLoadingCompatibles(false);
    } else {
      setCompatibles([]);
    }
  };

  const handleClearSelected = () => {
    setSelectedProduct(null);
    setCompatibles([]);
  };

  const handleCategoryChange = (cat: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, cat] : prev.filter((c) => c !== cat)
    );
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <ProductSearchHero
        products={products}
        onSelectProduct={handleSelectProduct}
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
            <Input
              placeholder="Buscar"
              size="sm"
              mb="md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ScrollArea.Autosize mah={360} type="scroll">
              <Stack>
                {categoryOptions.map((cat) => (
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
                          {
                            products.filter(
                              (prod) => (prod.type || "Sin tipo") === cat
                            ).length
                          }
                        </Text>
                      </Flex>
                    }
                    mb={4}
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Box>

          {/* Main area */}
          <Box flex={1} w="100%" mih={620}>
            {/* Panel superior: Producto buscado */}
            {selectedProduct && (
              <Box mb="lg">
                <Text fw={700} size="xl" mb={6}>
                  Producto buscado
                </Text>
                <Box
                  bdrs={16}
                  mb={24}
                  p={"18px 28px"}
                  maw={1100}
                  mih={120}
                  pos={"relative"}
                  style={{
                    backgroundColor: "#f6f6f6",
                    boxShadow: "0 2px 8px 0 #eee",
                  }}
                >
                  <Flex align="center">
                    {/* Botón X */}
                    <Button
                      onClick={handleClearSelected}
                      pos={"absolute"}
                      right={0}
                      top={0}
                      variant="transparent"
                      size="xl"
                    >
                      ×
                    </Button>
                    {/* Imagen */}
                    <Box mr="lg">
                      <Image
                        src={selectedProduct.image || ""}
                        alt={selectedProduct.name || "Producto"}
                        width={70}
                        height={70}
                        bdrs="md"
                        fit="cover"
                        fallbackSrc="https://via.placeholder.com/80x80?text=Sin+Imagen"
                      />
                    </Box>
                    {/* Info */}
                    <Box>
                      <Text fw={700} size="xl">
                        {selectedProduct.name}
                      </Text>
                      <Text c="dimmed" size="sm" mt={2}>
                        Código: {selectedProduct.code}
                      </Text>
                      <Group mt={20} align="center" gap={14}>
                        <Button size="md" bg="black" bdrs="lg">
                          Agregar al carrito (TBD)
                        </Button>
                        {selectedProduct.datasheet && (
                          <Text
                            fw={400}
                            component="a"
                            href={selectedProduct.datasheet}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="md"
                            c="dimmed"
                            mr="sm"
                            td="underline"
                          >
                            Ver ficha técnica ↗
                          </Text>
                        )}
                      </Group>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            )}

            {/* Productos compatibles */}
            {selectedProduct && (
              <Box mb="lg">
                <Text fw={700} size="xl" mb={0} mt={10}>
                  Productos compatibles
                </Text>
                <Text c="dimmed" size="sm" mb="lg">
                  ({compatibles.length} resultado
                  {compatibles.length === 1 ? "" : "s"})
                </Text>
                {loadingCompatibles ? (
                  <Loader />
                ) : (
                  <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                    spacing="lg"
                  >
                    {compatibles.map((comp) => (
                      <Card
                        key={comp.code}
                        withBorder
                        radius="lg"
                        style={{
                          background: "#f6f6f6",
                          minHeight: 230,
                          position: "relative",
                          boxShadow:
                            selectedProduct &&
                            comp.code === selectedProduct.code
                              ? "0 0 0 2px #ffd43b"
                              : undefined,
                          opacity:
                            selectedProduct &&
                            comp.code === selectedProduct.code
                              ? 0.6
                              : 1,
                          cursor: "pointer",
                          transition: "box-shadow 0.2s",
                        }}
                        onClick={() => handleSelectProduct(comp)}
                      >
                        <Card.Section
                          style={{ position: "relative", margin: "5px" }}
                        >
                          <Image
                            src={comp.image || ""}
                            alt={comp.name || "Producto"}
                            height={120}
                            fit="contain"
                            fallbackSrc="https://via.placeholder.com/180x120?text=Sin+Imagen"
                            style={{ objectFit: "cover", borderRadius: "10px" }}
                          />
                        </Card.Section>
                        <Stack align="center" gap={0} mt="md">
                          {/* <Text size="md" fw={500}>
                            {comp.group || "Sin categoría"}
                          </Text> */}
                          <Text size="lg" fw={600}>
                            {comp.name}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {comp.code}
                          </Text>
                        </Stack>
                        <Button size="xs" bg="black" bdrs="lg" my="sm">
                          Agregar al carrito (TBD)
                        </Button>
                        {comp.datasheet && (
                          <Text
                            component="a"
                            href={comp.datasheet}
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
                )}
              </Box>
            )}

            {/* Grilla de productos */}
            <Text fw={700} size="xl" mb={2} mt={selectedProduct ? 38 : 0}>
              Todos nuestros productos
            </Text>
            <Text c="dimmed" size="sm" mb="lg">
              ({filteredProducts.length} resultados)
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {filteredProducts.map((prod) => (
                <Card
                  key={prod.code}
                  withBorder
                  radius="lg"
                  style={{
                    background: "#f6f6f6",
                    minHeight: 230,
                    position: "relative",
                    boxShadow:
                      selectedProduct && prod.code === selectedProduct.code
                        ? "0 0 0 2px #ffd43b"
                        : undefined,
                    opacity:
                      selectedProduct && prod.code === selectedProduct.code
                        ? 0.6
                        : 1,
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                  }}
                  onClick={() => handleSelectProduct(prod)}
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
                    {/* <Text size="md" fw={500}>
                      {prod.group || "Sin categoría"}
                    </Text> */}
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
