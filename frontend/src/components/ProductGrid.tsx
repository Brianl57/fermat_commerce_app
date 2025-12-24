
import type { Product } from "../types/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
    products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                No products found matching your filters.
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}
