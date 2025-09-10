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
  Pagination,
  Select,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { Product } from "../types/Product";
import { searchProducts } from "../services/productService";
import ProductSearchHero from "../components/ProductSearchHero";
import CustomLoader from "../components/CustomLoader"; // 👈 loader inicial
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
              style={{ opacity: 1 }}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                if (checked) onChange([...selectedCategories, name]);
                else onChange(selectedCategories.filter((c) => c !== name));
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
                if (checked) onChange([...selectedCategories, name]);
                else onChange(selectedCategories.filter((c) => c !== name));
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState<number>(20);

  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [compatibleProducts, setCompatibleProducts] = useState<Product[]>([]);

  // 👇 loaders separados
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 48em)");

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

  const [reqId, setReqId] = useState(0);

  const fetchData = async (
    s = search,
    cats = selectedCategories,
    p = page,
    l = limit,
    opts?: { initial?: boolean }
  ) => {
    const currentId = reqId + 1;
    setReqId(currentId);

    // decide qué loader mostrar
    if (opts?.initial) setInitialLoading(true);
    else setSearchLoading(true);

    try {
      const {
        products,
        filters,
        totalPages,
        total,
        matchedProduct,
        compatibleProducts,
      } = await searchProducts(s, cats, p, l);

      // evita race conditions
      if (currentId !== reqId + 1) return;

      setProducts(products);
      setFilterOptions(filters.types);
      setTotalPages(totalPages);
      setTotal(total);
      setMatchedProduct(matchedProduct ?? null);
      setCompatibleProducts(compatibleProducts ?? []);
    } catch (err) {
      console.error("Error buscando productos:", err);
    } finally {
      if (opts?.initial) setInitialLoading(false);
      else setSearchLoading(false);
    }
  };

  // carga inicial
  useEffect(() => {
    fetchData(search, selectedCategories, page, limit, { initial: true });
    // eslint-disable-next-line
  }, []);

  // búsqueda en vivo con debounce (usa loader de búsqueda)
  useEffect(() => {
    const q = search.trim();

    if (q.length === 0) {
      setPage(1);
      const id = setTimeout(
        () => fetchData("", selectedCategories, 1, limit),
        150
      );
      return () => clearTimeout(id);
    }

    const t = setTimeout(() => {
      setPage(1);
      fetchData(q, selectedCategories, 1, limit);
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategories, limit]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(search, selectedCategories, newPage, limit);
  };

  const handleFilterChange = (cats: string[]) => {
    setSelectedCategories(cats);
    setPage(1);
    fetchData(search, cats, 1, limit);
  };

  const handleSearchEnter = () => {
    setPage(1);
    fetchData(search, selectedCategories, 1, limit);
  };

  const handleSelectSuggestion = (s: string) => {
    setSearch(s);
    fetchData(s, selectedCategories, 1, limit);
  };

  const handleSelectProduct = (prod: Product) => {
    setSearch(prod.name || "");
    fetchData(prod.name || "", selectedCategories, 1, limit);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchData("", selectedCategories, 1, limit);
  };

  const handleChangeLimit = (value: string | null) => {
    const newLimit = parseInt(value || "20", 10);
    setLimit(newLimit);
    setPage(1);
    fetchData(search, selectedCategories, 1, newLimit);
  };

  let indicatorText: React.ReactNode = "";
  if (search.trim() && selectedCategories.length) {
    indicatorText = (
      <>
        <b>Buscando:</b> <i>"{search}"</i>&nbsp;
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

  // 👇 Solo loader inicial desmonta el resto
  if (initialLoading) return <CustomLoader />;

  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <Box>
      <ProductSearchHero
        products={products}
        search={search}
        setSearch={setSearch}
        onSelectSuggestion={handleSelectSuggestion}
        onSelectProduct={handleSelectProduct}
        onEnter={handleSearchEnter}
        loading={searchLoading} // 👈 solo loader de búsqueda
        onClear={handleClearSearch}
        matchedProduct={matchedProduct}
        compatibleProducts={compatibleProducts}
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
              <Group justify="space-between" align="center" mb="sm" wrap="wrap">
                <Text fw={700} size="xl">
                  {indicatorText}
                </Text>
                <Group gap="xs">
                  <Text c="dimmed" size="sm">
                    Mostrando {startIdx}-{endIdx} de {total}
                  </Text>
                  <Select
                    w={160}
                    size="xs"
                    value={String(limit)}
                    data={[
                      { value: "10", label: "10 por página" },
                      { value: "20", label: "20 por página" },
                      { value: "40", label: "40 por página" },
                      { value: "60", label: "60 por página" },
                    ]}
                    onChange={handleChangeLimit}
                    allowDeselect={false}
                  />
                </Group>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
                {products.map((prod) => (
                  <ProductCard key={prod.code} product={prod} />
                ))}
              </SimpleGrid>

              {totalPages > 1 && (
                <Group justify="flex-end" mt="lg">
                  <Pagination
                    value={page}
                    onChange={handlePageChange}
                    total={totalPages}
                  />
                </Group>
              )}
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
