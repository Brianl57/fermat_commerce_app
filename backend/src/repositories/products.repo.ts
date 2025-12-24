import { initDb } from "../database/db";
import type { ListProductsInput } from "../services/products.service.ts";

export async function getProducts(_input: ListProductsInput) {
    const db = await initDb();

    const rows = await db.all<any[]>(`
    SELECT p.*, GROUP_CONCAT(pt.tag) as tags
    FROM products p
    LEFT JOIN product_tags pt ON p.id = pt.productId
    GROUP BY p.id
  `);

    return rows.map((p) => ({
        ...p,
        inStock: Boolean(p.inStock),
        tags: p.tags ? String(p.tags).split(",") : [],
    }));
}
