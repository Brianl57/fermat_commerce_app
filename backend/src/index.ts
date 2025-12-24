import express from "express";
import cors from "cors";
import { initDb } from "./db";

async function main() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    await initDb();

    app.get("/health", (_req, res) => res.json({ ok: true }));

    // GET /api/products
    app.get("/api/products", async (req, res) => {
        try {
            const db = await initDb();
            // Basic implementation: fetch all products with tags
            // For searching/sorting/filtering, we'll expand this later.
            // Using GROUP_CONCAT to get tags in one query
            const products = await db.all(`
        SELECT p.*, GROUP_CONCAT(pt.tag) as tags
        FROM products p
        LEFT JOIN product_tags pt ON p.id = pt.productId
        GROUP BY p.id
      `);

            // Transform result: split tags string into array
            const items = products.map((p) => ({
                ...p,
                inStock: Boolean(p.inStock), // Convert 0/1 to boolean
                tags: p.tags ? p.tags.split(",") : [],
            }));

            res.json({ items });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    const port = Number(process.env.PORT ?? 4000);
    app.listen(port, () => console.log(`Listening to backend server on port: ${port}`));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
