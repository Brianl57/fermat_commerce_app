import { describe, it, expect, beforeAll, afterAll } from "vitest";
import path from "path";
import os from "os";
import { mkdtemp, rm } from "fs/promises";
import { initDb } from "../src/db";
import sqlite3 from "sqlite3";
import type { Database } from "sqlite";

let tempDir: string;
let dbPath: string;
let db: Database<sqlite3.Database, sqlite3.Statement>;

beforeAll(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "ecom-backend-"));
  dbPath = path.join(tempDir, "test.db");

  db = await initDb({
    filename: dbPath,
    schemaPath: path.join(process.cwd(), "sql", "schema.sql"),
  });
});

afterAll(async () => {
  await db.close();
  await rm(tempDir, { recursive: true, force: true });
});

describe("initDb", () => {
  it("creates expected tables from schema.sql", async () => {
    const rows = await db.all<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`
    );

    const names = rows.map((r) => r.name);

    expect(names).toContain("products");
    expect(names).toContain("orders");
    expect(names).toContain("order_items");
    expect(names).toContain("product_tags");
  });
});
