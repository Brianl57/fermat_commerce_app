
import { useEffect, useState, useCallback } from "react";
import {
    fetchProducts,
    fetchFilterOptions,
    type Product,
    type ProductQuery,
} from "../api/products";
import { ProductGrid } from "../components/ProductGrid";
import { FilterPanel } from "../components/FilterPanel";

export default function CatalogPage() {
    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceCap, setPriceCap] = useState(500);

    // Initial Fetch: Filters
    useEffect(() => {
        fetchFilterOptions()
            .then((data) => {
                setAvailableCategories(data.categories);
                setAvailableBrands(data.brands);
            })
            .catch((err) => console.error(err));
    }, []);

    // Unified Product Fetch
    const loadProducts = useCallback(
        async (
            q: string,
            cats: string[],
            brands: string[],
            price: number
        ) => {
            setLoading(true);
            setError(null);

            const query: ProductQuery = {
                q: q.trim() || undefined,
                category: cats.length > 0 ? cats : undefined,
                brand: brands.length > 0 ? brands : undefined,
                minPrice: 0,
                maxPrice: price < 500 ? price : undefined,
            };

            try {
                const res = await fetchProducts(query);
                setProducts(res.items);
            } catch (err) {
                console.error(err);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Effect: Trigger fetch whenever filters change
    // Note: We include Query/Filters in dependency array to auto-fetch
    useEffect(() => {
        // For search query, we might want to debounce in real app, but requirements say "immediate" for filters.
        // For text search, let's keep it manual (Enter/Button) OR if you want immediate, add it here.
        // Wait, the plan said "User checks 'Nike' -> Immediate".
        // Let's assume text search is still "Enter/Button" to avoid rapid firing, but filters are immediate.
        // Actually, user APPROVED plan saying "Selecting a checkbox ... immediately triggers a fetch".
        // Text search usually isn't immediate unless debounced. I'll stick to trigger on filter change ONLY?
        // User requested: "selecting a filter ... applies immediately".
        // I will call loadProducts manually in handlers to be safe and explicit, or use an effect.
        // Using an effect for everything is cleaner if we want "reactive" UI.
        // But text search usually needs debounce.
        // I'll stick to: Handlers call loadProducts.
    }, []);

    // Handler: Search Button / Enter
    const handleSearch = () => {
        loadProducts(searchQuery, selectedCategories, selectedBrands, priceCap);
    };

    // Handler: Filter Changes (Immediate)
    const toggleCategory = (cat: string) => {
        const newCats = selectedCategories.includes(cat)
            ? selectedCategories.filter((c) => c !== cat)
            : [...selectedCategories, cat];
        setSelectedCategories(newCats);
        loadProducts(searchQuery, newCats, selectedBrands, priceCap);
    };

    const toggleBrand = (brand: string) => {
        const newBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter((b) => b !== brand)
            : [...selectedBrands, brand];
        setSelectedBrands(newBrands);
        loadProducts(searchQuery, selectedCategories, newBrands, priceCap);
    };

    const changePrice = (price: number) => {
        setPriceCap(price);
        // Debounce slider dragging? requirements say "releasing" or "immediate".
        // Range input onChange fires continuously. onMouseUp is safer for fetch, but onChange drives UI.
        // I will fetch on `onMouseUp` in the component, OR just debounce here.
        // For simplicity/responsiveness, let's fetch on every change (might vary based on performance)
        // or better: The FilterPanel calls this onChange. I can debounce it there or here.
        // Let's just call it.
        loadProducts(searchQuery, selectedCategories, selectedBrands, price);
    };

    // Revised Price Handler for "MouseUp" optimization if needed, but for now simple onChange.
    // Actually, FilterPanel prop is `onChangePrice`. If I pass `changePrice` directly, it fetches on every tick.
    // Better UX: Update state on change, fetch on mouse up (commit). 
    // For now I'll just do direct fetch (Simpler code, might be spammy but safe for local).

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceCap(500);
        // Keep search query? Usually clear filters means clear filters, not search text.
        loadProducts(searchQuery, [], [], 500);
    };

    // Initial Load
    useEffect(() => {
        loadProducts("", [], [], 500);
    }, [loadProducts]);

    return (
        <div className="container mx-auto p-4 flex gap-6">
            {/* Sidebar */}
            <FilterPanel
                availableCategories={availableCategories}
                availableBrands={availableBrands}
                selectedCategories={selectedCategories}
                selectedBrands={selectedBrands}
                priceCap={priceCap}
                loading={loading}
                onChangeCategory={toggleCategory}
                onChangeBrand={toggleBrand}
                onChangePrice={changePrice}
                onClearFilters={clearFilters}
            />

            {/* Main Content */}
            <div className="flex-1">
                <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>

                {/* Search Bar */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="border p-2 rounded flex-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>

                {/* Loading / Error / Grid */}
                {loading && <div className="text-gray-500 mb-4">Loading products...</div>}

                {error && <div className="text-red-500 mb-4">{error}</div>}

                {!loading && !error && products.length === 0 && (
                    <div className="text-gray-500">No products found.</div>
                )}

                {!error && products.length > 0 && <ProductGrid products={products} />}
            </div>
        </div>
    );
}
