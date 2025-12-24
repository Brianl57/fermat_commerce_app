import { initDb } from "../src/db";
import fs from "fs/promises";
import path from "path";
import { Database } from "sqlite";
import sqlite3 from "sqlite3";

export async function seed(providedDb?: Database<sqlite3.Database, sqlite3.Statement>) {
    const db = providedDb ?? await initDb();

    try {
        // Read data files
        const productsData = JSON.parse(
            await fs.readFile(path.join(process.cwd(), "data", "products.json"), "utf-8")
        );
        const ordersData = JSON.parse(
            await fs.readFile(path.join(process.cwd(), "data", "orders.json"), "utf-8")
        );

        await db.exec("BEGIN TRANSACTION");

        // Clear existing data (optional, but good for idempotent seeding)
        await db.exec("DELETE FROM order_items");
        await db.exec("DELETE FROM orders");
        await db.exec("DELETE FROM product_tags");
        await db.exec("DELETE FROM products");

        // Seed Products
        console.log(`Seeding ${productsData.length} products...`);
        const insertProductStmt = await db.prepare(
            `INSERT INTO products (id, name, description, price, category, brand, rating, inStock, imageUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const insertTagStmt = await db.prepare(
            `INSERT INTO product_tags (productId, tag) VALUES (?, ?)`
        );

        for (const product of productsData) {
            await insertProductStmt.run(
                product.id,
                product.name,
                product.description,
                product.price,
                product.category,
                product.brand,
                product.rating,
                product.inStock ? 1 : 0,
                product.imageUrl
            );

            for (const tag of product.tags) {
                await insertTagStmt.run(product.id, tag);
            }
        }
        await insertProductStmt.finalize();
        await insertTagStmt.finalize();

        // Seed Orders
        console.log(`Seeding ${ordersData.length} orders...`);
        const insertOrderStmt = await db.prepare(
            `INSERT INTO orders (orderId, date, customerId, total) VALUES (?, ?, ?, ?)`
        );
        const insertOrderItemStmt = await db.prepare(
            `INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)`
        );

        for (const order of ordersData) {
            await insertOrderStmt.run(
                order.orderId,
                order.date,
                order.customerId,
                order.total
            );

            for (const item of order.items) {
                await insertOrderItemStmt.run(
                    order.orderId,
                    item.productId,
                    item.quantity,
                    item.price
                );
            }
        }
        await insertOrderStmt.finalize();
        await insertOrderItemStmt.finalize();

        await db.exec("COMMIT");
        console.log("Seeding completed successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
        await db.exec("ROLLBACK");
        if (!providedDb) {
            process.exit(1);
        } else {
            throw error;
        }
    }
}

if (require.main === module) {
    seed().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
