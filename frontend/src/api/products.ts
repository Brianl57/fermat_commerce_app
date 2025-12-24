
import type { Product } from "../types/product";
export type { Product };

export type SortKey = "price_asc" | "price_desc" | "rating_desc" | "popular_desc";

export type ProductQuery = {
    q?: string;
    category?: string[];   // multi-select
    brand?: string[];      // multi-select
    tags?: string[];       // multi-select
    minPrice?: number;
    maxPrice?: number;
    sort?: SortKey;
};

export type ProductsResponse = {
    items: Product[];
};

function buildQuery(params: ProductQuery) {
    const sp = new URLSearchParams();

    if (params.q) sp.set("q", params.q);
    if (params.minPrice != null) sp.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) sp.set("maxPrice", String(params.maxPrice));
    if (params.sort) sp.set("sort", params.sort);

    for (const c of params.category ?? []) sp.append("category", c);
    for (const b of params.brand ?? []) sp.append("brand", b);
    for (const t of params.tags ?? []) sp.append("tags", t);

    const qs = sp.toString();
    return qs ? `?${qs}` : "";
}

export async function fetchProducts(params: ProductQuery): Promise<ProductsResponse> {
    const res = await fetch(`/api/products${buildQuery(params)}`);
    if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
    return res.json();
}
