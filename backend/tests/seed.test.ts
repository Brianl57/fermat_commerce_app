
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import fs from "fs/promises";
import path from "path";
import { seed } from "../scripts/seed";

describe("Seeding Script", () => {
    let db: Database<sqlite3.Database, sqlite3.Statement>;
    const TEST_DB_PATH = path.join(process.cwd(), "test.db");

    beforeAll(async () => {
        // 1. Create a fresh test database
        db = await open({
            filename: TEST_DB_PATH,
            driver: sqlite3.Database,
        });

        // 2. Initialize Schema
        const schemaPath = path.join(process.cwd(), "sql", "schema.sql");
        const schemaSql = await fs.readFile(schemaPath, "utf-8");
        await db.exec(schemaSql);
    });

    afterAll(async () => {
        // 3. Cleanup
        await db.close();
        await fs.unlink(TEST_DB_PATH);
    });

    it("should populate the database with correct counts", async () => {
        // 4. Run Seed
        await seed(db);

        // 5. Verify counts
        const productsCount = await db.get("SELECT count(*) as count FROM products");
        const ordersCount = await db.get("SELECT count(*) as count FROM orders");
        const tagsCount = await db.get("SELECT count(*) as count FROM product_tags");
        const orderItemsCount = await db.get("SELECT count(*) as count FROM order_items");

        expect(productsCount.count).toBe(2000);
        expect(ordersCount.count).toBe(5000);
        // Since tags and items are dependent on the random generation in the json (implied fixed dataset),
        // we expect the counts to match what we saw manually: 6000 tags, 12549 items.
        expect(tagsCount.count).toBe(6000);
        expect(orderItemsCount.count).toBe(12549);
    });
});
