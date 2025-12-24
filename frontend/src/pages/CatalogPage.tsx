
import { useEffect, useState, useCallback } from "react";
import {
    fetchProducts,
    fetchFilterOptions,
    type Product,
    type ProductQuery,
} from "../api/products";
import { ProductGrid } from "../components/ProductGrid";
import { FilterPanel } from "../components/FilterPanel";
import { SortDropdown } from "../components/SortDropdown";
import "../styles/CatalogPage.css";

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
    const [sortOption, setSortOption] = useState("");

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
            price: number,
            sort: string
        ) => {
            setLoading(true);
            setError(null);

            const query: ProductQuery = {
                q: q.trim() || undefined,
                category: cats.length > 0 ? cats : undefined,
                brand: brands.length > 0 ? brands : undefined,
                minPrice: 0,
                maxPrice: price < 500 ? price : undefined,
                sort: (sort || undefined) as ProductQuery["sort"],
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

    // Handler: Search Button / Enter
    const handleSearch = () => {
        loadProducts(searchQuery, selectedCategories, selectedBrands, priceCap, sortOption);
    };

    // Handler: Filter Changes (Immediate)
    const toggleCategory = (cat: string) => {
        const newCats = selectedCategories.includes(cat)
            ? selectedCategories.filter((c) => c !== cat)
            : [...selectedCategories, cat];
        setSelectedCategories(newCats);
        loadProducts(searchQuery, newCats, selectedBrands, priceCap, sortOption);
    };

    const toggleBrand = (brand: string) => {
        const newBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter((b) => b !== brand)
            : [...selectedBrands, brand];
        setSelectedBrands(newBrands);
        loadProducts(searchQuery, selectedCategories, newBrands, priceCap, sortOption);
    };

    const changePrice = (price: number) => {
        setPriceCap(price);
        loadProducts(searchQuery, selectedCategories, selectedBrands, price, sortOption);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceCap(500);
        loadProducts(searchQuery, [], [], 500, sortOption);
    };

    const changeSort = (sort: string) => {
        setSortOption(sort);
        loadProducts(searchQuery, selectedCategories, selectedBrands, priceCap, sort);
    };

    // Initial Load
    useEffect(() => {
        loadProducts("", [], [], 500, "");
    }, [loadProducts]);

    return (
        <div className="catalog-container">
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
            <div className="catalog-main">

                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button onClick={handleSearch} className="search-btn">
                        Search
                    </button>
                    <SortDropdown
                        value={sortOption}
                        onChange={changeSort}
                        disabled={loading}
                    />
                </div>

                {/* Loading / Error / Grid */}
                {loading && <div className="loading-msg">Loading products...</div>}

                {error && <div className="error-msg">{error}</div>}

                {!loading && !error && products.length === 0 && (
                    <div className="empty-msg">No products found.</div>
                )}

                {!error && products.length > 0 && <ProductGrid products={products} />}
            </div>
        </div>
    );
}

