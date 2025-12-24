import { initDb } from "../database/db";
import type { ListProductsInput } from "../services/products.service.ts";

export async function getProducts(input: ListProductsInput) {
    const db = await initDb();

    const { q, category, brand, minPrice, maxPrice, sort } = input;

    // Base query with LEFT JOINs for tags and purchase count
    let query = `
    SELECT 
      p.*, 
      GROUP_CONCAT(DISTINCT pt.tag) as tags,
      COALESCE(SUM(oi.quantity), 0) as purchaseCount
    FROM products p
    LEFT JOIN product_tags pt ON p.id = pt.productId
    LEFT JOIN order_items oi ON p.id = oi.productId
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

    // Add ORDER BY based on sort parameter
    switch (sort) {
        case "price_asc":
            query += ` ORDER BY p.price ASC`;
            break;
        case "price_desc":
            query += ` ORDER BY p.price DESC`;
            break;
        case "rating":
            query += ` ORDER BY p.rating DESC`;
            break;
        case "popular":
            query += ` ORDER BY purchaseCount DESC`;
            break;
        // default: no ORDER BY (relevance)
    }

    const rows = await db.all<any[]>(query, params);

    return rows.map((p) => ({
        ...p,
        inStock: Boolean(p.inStock),
        tags: p.tags ? String(p.tags).split(",") : [],
        purchaseCount: Number(p.purchaseCount) || 0,
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
