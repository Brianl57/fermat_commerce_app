import { initDb } from "../database/db";
import type { ListProductsInput } from "../services/products.service.ts";

export async function getProducts(input: ListProductsInput) {
    const db = await initDb();

    const { q, category, brand, minPrice, maxPrice } = input;

    let query = `
    SELECT p.*, GROUP_CONCAT(pt.tag) as tags
    FROM products p
    LEFT JOIN product_tags pt ON p.id = pt.productId
  `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (q) {
        conditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
        const term = `%${q}%`;
        params.push(term, term);
    }

    if (category && category.length > 0) {
        const placeholders = category.map(() => "?").join(",");
        conditions.push(`p.category IN (${placeholders})`);
        params.push(...category);
    }

    if (brand && brand.length > 0) {
        const placeholders = brand.map(() => "?").join(",");
        conditions.push(`p.brand IN (${placeholders})`);
        params.push(...brand);
    }

    if (minPrice !== undefined) {
        conditions.push(`p.price >= ? `);
        params.push(minPrice);
    }

    if (maxPrice !== undefined) {
        conditions.push(`p.price <= ? `);
        params.push(maxPrice);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += ` GROUP BY p.id`;

    const rows = await db.all<any[]>(query, params);

    return rows.map((p) => ({
        ...p,
        inStock: Boolean(p.inStock),
        tags: p.tags ? String(p.tags).split(",") : [],
    }));
}

export async function getFilterOptions() {
    const db = await initDb();
    const categories = await db.all<{ category: string }[]>("SELECT DISTINCT category FROM products ORDER BY category");
    const brands = await db.all<{ brand: string }[]>("SELECT DISTINCT brand FROM products ORDER BY brand");

    return {
        categories: categories.map((c) => c.category),
        brands: brands.map((b) => b.brand),
    };
}
