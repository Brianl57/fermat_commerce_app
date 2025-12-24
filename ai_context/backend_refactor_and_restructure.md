# Backend Refactor Plan (Simple + Scalable)

Goal: keep the backend easy to extend for core features (search, multi-filtering, sorting including “most popular”) without adding unnecessary framework complexity.

This structure separates:
- HTTP layer (Express routes)
- Business logic (services)
- Data access (raw SQL repositories)
- Database initialization (SQLite)
- Centralized configuration (config)

---

## Target Folder Structure

backend/
  src/
    index.ts
    app.ts
    config/
      database.ts
    database/
      db.ts
    routes/
      health.ts
      products.ts
    services/
      products.service.ts
    repositories/
      products.repo.ts
    types/
      product.ts

Notes:
- `database/` folder (renamed from `db/`)
- database file is `database/db.ts` (keep filename `db.ts`)
- `config/` folder stores configuration defaults (ex: SQLite path, schema path)

---

## Step-by-Step Refactor

### 1) Create `src/app.ts` (Express app wiring)

src/app.ts:
```ts
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { productsRouter } from "./routes/products";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/products", productsRouter);

  return app;
}
```

### 2) Update src/index.ts (bootstrap DB + listen)
src/index.ts:
```ts
import { createApp } from "./app";
import { initDb } from "./database/db";

async function main() {
  await initDb();

  const app = createApp();
  const port = Number(process.env.PORT ?? 4000);

  app.listen(port, () => console.log(`Listening to backend server on port: ${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### 3) Add src/config/database.ts (central DB config defaults)
src/config/database.ts:
```ts
import path from "path";

export type InitDbOptions = {
  filename?: string;
  schemaPath?: string;
};

export function getDatabaseConfig(opts: InitDbOptions = {}) {
  return {
    filename:
      opts.filename ??
      process.env.SQLITE_PATH ??
      path.join(process.cwd(), "app.db"),

    schemaPath:
      opts.schemaPath ??
      path.join(process.cwd(), "sql", "schema.sql"),
  };
}
```

### 4) Move and update DB initializer: src/database/db.ts
Move your current db.ts to:
src/database/db.ts
Then update it to use the config module:
```ts
import { readFile } from "fs/promises";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { getDatabaseConfig, type InitDbOptions } from "../config/database";

sqlite3.verbose();

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb(opts: InitDbOptions = {}) {
  if (db) return db;

  const { filename, schemaPath } = getDatabaseConfig(opts);

  db = await open({
    filename,
    driver: sqlite3.Database,
  });

  const schemaSql = await readFile(schemaPath, "utf-8");
  await db.exec(schemaSql);

  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}
```

### 5) Add src/routes/health.ts
src/routes/health.ts:
```ts
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ ok: true });
});
```

### 6) Add src/routes/products.ts (HTTP layer only)
Routes should:
- parse query params
- call the service
- return JSON
- avoid raw SQL
src/routes/products.ts:
```ts
import { Router } from "express";
import { listProducts } from "../services/products.service";

export const productsRouter = Router();

productsRouter.get("/", async (req, res) => {
  try {
    const result = await listProducts({
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      category: toStringArray(req.query.category),
      brand: toStringArray(req.query.brand),
      minPrice: toNumber(req.query.minPrice),
      maxPrice: toNumber(req.query.maxPrice),
      sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    });

    res.json({ items: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function toStringArray(v: unknown): string[] | undefined {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return undefined;
}

function toNumber(v: unknown): number | undefined {
  if (typeof v !== "string") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
```

### 7) Add src/services/products.service.ts (business logic boundary)
Services hold business logic decisions:

- validation rules (later)
- default sort (later)
- composition of filter behavior (later)

src/services/products.service.ts:
```ts
import { getProducts } from "../repositories/products.repo";

export type ListProductsInput = {
  q?: string;
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: string; // later: union type
};

export async function listProducts(input: ListProductsInput) {
  return getProducts(input);
}
```

### 8) Add src/repositories/products.repo.ts (raw SQL + mapping)
Repositories are responsible for:

- raw SQL
- parameters
- joins (tags, popularity)
- mapping DB rows -> API response shape

Start with your current query, then expand later for filtering/sorting/search.

src/repositories/products.repo.ts:
```ts
import { initDb } from "../database/db";
import type { ListProductsInput } from "../services/products.service";

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
```

### 9) Add src/types/product.ts (shared backend type)
src/types/product.ts:
```ts
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  inStock: boolean;
  imageUrl: string;
  tags: string[];
  popularity?: number;
};
```

Outcome

After this refactor:

- index.ts only boots the app and starts listening
- app.ts only wires middleware and routes
- routes/ only parses request params and sends responses
- services/ is where core behavior rules live
- repositories/ contains raw SQL and row mapping
- database/db.ts owns SQLite initialization
- config/ centralizes config defaults

This keeps the backend small but ready for adding:

- search (name/description)
- multi-select category/brand
- min/max price
- sort by price/rating/popularity