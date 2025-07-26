import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Stack,
  Text,
  SimpleGrid,
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
import ProductSearchHero from "../components/ProductSearchHero";
import CustomLoader from "../components/CustomLoader";
import { IconFilter } from "@tabler/icons-react";
import ProductCard from "../components/ProductCard";

type FilterOption = { name: string; count: number };
type CategoryFilterProps = {
  filterOptions: FilterOption[];
  selectedCategories: string[];
  onChange: (cats: string[]) => void;
};

function CategorySidebarFilter({
  filterOptions,
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
          {filterOptions.map(({ name, count }) => (
            <Checkbox
              key={name}
              label={
                <Group gap={6}>
                  <Text size="sm">{name}</Text>
                  <Text size="xs" c="dimmed">
                    ({count})
                  </Text>
                </Group>
              }
              checked={selectedCategories.includes(name)}
              // 👇 NUNCA disables el checkbox
              // disabled={false}
              style={{
                opacity: 1, // Opcional: si quieres grisar cuando count 0, pon: count === 0 ? 0.65 : 1
              }}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                if (checked) {
                  onChange([...selectedCategories, name]);
                } else {
                  onChange(selectedCategories.filter((c) => c !== name));
                }
              }}
              mb={2}
              size="sm"
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
      <Group gap={8} mt="lg">
        <Button
          variant="default"
          color="gray"
          size="xs"
          onClick={() => onChange(filterOptions.map((f) => f.name))}
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

function CategoryMenuFilter({
  filterOptions,
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
          {filterOptions.map(({ name, count }) => (
            <Checkbox
              key={name}
              label={
                <Group gap={6}>
                  <Text size="sm">{name}</Text>
                  <Text size="xs" c="dimmed">
                    ({count})
                  </Text>
                </Group>
              }
              checked={selectedCategories.includes(name)}
              disabled={count === 0 && !selectedCategories.includes(name)}
              style={{
                opacity:
                  count === 0 && !selectedCategories.includes(name) ? 0.5 : 1,
              }}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                if (checked) {
                  onChange([...selectedCategories, name]);
                } else {
                  onChange(selectedCategories.filter((c) => c !== name));
                }
              }}
              mb={2}
              size="sm"
            />
          ))}
        </Stack>
        <Button
          variant="default"
          color="gray"
          fullWidth
          size="xs"
          mt="xs"
          onClick={() => onChange(filterOptions.map((f) => f.name))}
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
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width: 48em)");

  // Siempre mostrar los filtros seleccionados aunque estén en 0
  const mergedFilterOptions = [
    ...filterOptions,
    ...selectedCategories
      .filter((cat) => !filterOptions.some((f) => f.name === cat))
      .map((name) => ({ name, count: 0 })),
  ];

  const isSearch = search.trim().length > 0;
  const visibleFilterOptions = isSearch
    ? mergedFilterOptions.filter((f) => f.count > 0)
    : mergedFilterOptions;

  // Solo buscar cuando lo pidas (no cada cambio en search)
  const fetchData = async (s = search, cats = selectedCategories) => {
    setLoading(true);
    const { products, filters } = await searchProducts(s, cats);
    setProducts(products);
    setFilterOptions(filters.types);
    setLoading(false);
  };

  // Carga inicial de productos
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Al cambiar filtros lateral, sí actualiza inmediatamente:
  const handleFilterChange = (cats: string[]) => {
    setSelectedCategories(cats);
    fetchData(search, cats);
  };

  // Al dar Enter en el buscador:
  const handleSearchEnter = () => {
    fetchData(search, selectedCategories);
  };

  // Al seleccionar sugerencia:
  const handleSelectSuggestion = (s: string) => {
    setSearch(s);
    fetchData(s, selectedCategories);
  };

  // Al seleccionar producto recomendado:
  const handleSelectProduct = (prod: Product) => {
    setSearch(prod.name || "");
    fetchData(prod.name || "", selectedCategories);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchData("", selectedCategories); // Vuelve a mostrar todo
  };

  // Calcula qué se está mostrando
  let indicatorText: React.ReactNode = "";
  if (search.trim() && selectedCategories.length) {
    indicatorText = (
      <>
        <b>Buscando:</b> <i>"{search}"</i> &nbsp;
        <span style={{ color: "#888" }}>|</span>&nbsp;
        <b>Filtrando por:</b>{" "}
        {selectedCategories.map((cat) => (
          <span key={cat} style={{ marginRight: 8 }}>
            {cat}
          </span>
        ))}
      </>
    );
  } else if (search.trim()) {
    indicatorText = (
      <>
        <b>Buscando:</b> <i>"{search}"</i>
      </>
    );
  } else if (selectedCategories.length) {
    indicatorText = (
      <>
        <b>Filtrando por:</b>{" "}
        {selectedCategories.map((cat) => (
          <span key={cat} style={{ marginRight: 8 }}>
            {cat}
          </span>
        ))}
      </>
    );
  } else {
    indicatorText = "Mostrando todos los productos";
  }

  if (loading) return <CustomLoader />;

  return (
    <Box>
      <ProductSearchHero
        products={products}
        search={search}
        setSearch={setSearch}
        onSelectSuggestion={handleSelectSuggestion}
        onSelectProduct={handleSelectProduct}
        onEnter={handleSearchEnter}
        loading={loading}
        onClear={handleClearSearch}
      />
      <Container size="xl" pt={rem(32)} pb={rem(40)}>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={32}
          align="start"
          w="100%"
        >
          {!isMobile && (
            <CategorySidebarFilter
              filterOptions={visibleFilterOptions}
              selectedCategories={selectedCategories}
              onChange={handleFilterChange}
            />
          )}
          {isMobile && (
            <Group justify="start" mb="lg">
              <CategoryMenuFilter
                filterOptions={visibleFilterOptions}
                selectedCategories={selectedCategories}
                onChange={handleFilterChange}
              />
            </Group>
          )}
          <Box flex={1} w="100%">
            <Box mih={620}>

              {/* Indicador de filtros/búsqueda */}
              <Text fw={700} size="xl" mb={2}>
                {indicatorText}
              </Text>
              <Text c="dimmed" size="sm" mb="lg">
                ({products.length} resultados)
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                {products.map((prod) => (
                  <ProductCard key={prod.code} product={prod} />
                ))}
              </SimpleGrid>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
