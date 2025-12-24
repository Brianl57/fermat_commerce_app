
import { useEffect, useState } from "react";
import { fetchProducts, type Product, type ProductQuery } from "../api/products";
import { ProductGrid } from "../components/ProductGrid";

export default function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initial fetch without filters
        loadProducts({});
    }, []);

    async function loadProducts(query: ProductQuery) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchProducts(query);
            setProducts(res.items);
        } catch (err) {
            console.error(err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>

            {/* TODO: Filters and Sort bar will go here */}

            {loading && <div>Loading products...</div>}

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {!loading && !error && <ProductGrid products={products} />}
        </div>
    );
}
