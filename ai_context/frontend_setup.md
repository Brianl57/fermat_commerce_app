# Frontend Setup Plan (Core Requirements Only)

This document describes the intended frontend setup and implementation plan. It explicitly excludes all optional/bonus features.

## Scope: Core Requirements Only

Frontend must support:
- Product grid display (cards)
- Search by product name OR description
- Filtering:
  - Category (multi-select)
  - Brand (multi-select)
  - Tags (multi-select)
  - Price range (min/max)
- Sorting:
  - Price: low → high
  - Price: high → low
  - Rating (desc)
  - Most popular (desc), based on backend popularity computation
- UX states:
  - Loading state
  - Empty state (no matches)
  - Error state
  - Clear indication of applied filters (and a “Clear filters” action)

Excluded (Bonus Features / Optional):
- Co-purchase recommendations
- Advanced facets / in-stock filtering
- Pagination or infinite scroll
- Debounced search, caching, React Query, etc.
- URL state persistence

---

## Tech Stack Choice

- React + Vite + TypeScript
- Minimal dependencies (fetch + React state)
- Local-only run (no deployment required)

---

## Repo Layout Assumption

e_commerce_app/
  backend/
  frontend/

Backend runs on:
- http://localhost:4000

Frontend runs on:
- Vite dev server (typically http://localhost:5173)

---

## 1) Create React + TS App (Vite)

From repo root:

cd e_commerce_app
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

---

## 2) Configure Dev Proxy (Frontend → Backend)

Goal: Frontend calls /api/... and Vite proxies to http://localhost:4000.

Edit frontend/vite.config.ts:

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});

After this, frontend should call:
- fetch("/api/products?...")
NOT:
- fetch("http://localhost:4000/api/products?...")

---

## 3) Dependencies

Keep it minimal (no React Query, no router required).

---

## 4) Frontend File/Folder Structure (Core Only)

Inside frontend/src/:

src/
  api/
    products.ts
  components/
    SearchBar.tsx
    FiltersPanel.tsx
    SortSelect.tsx
    ProductGrid.tsx
    ProductCard.tsx
    StatusBanner.tsx
  pages/
    CatalogPage.tsx
  types/
    product.ts
  App.tsx
  main.tsx

---

## 5) Types

Create frontend/src/types/product.ts:

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
  tags?: string[];

  // returned by backend for “Most popular” sort + indicator
  popularity?: number;
};

---

## 6) API Layer (Core Query Params Only)

Create frontend/src/api/products.ts:

import type { Product } from "../types/product";

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

---

## 7) Catalog Page Behavior (Core UX)

Create frontend/src/pages/CatalogPage.tsx and implement:

State to maintain:
- searchText (string)
- selectedCategories (string[])
- selectedBrands (string[])
- selectedTags (string[])
- minPrice (string or number; parse to number for query)
- maxPrice (string or number; parse to number for query)
- sort (SortKey)
- loading (boolean)
- error (string | null)
- items (Product[])

Data fetching rules:
- Build a query object from state.
- Fetch products when query changes.
- No debounce / caching needed.

UX states:
- Loading indicator while fetching
- Error banner on request failure
- Empty state if request succeeds but items.length === 0
- Grid of cards otherwise

Required UI elements:
- Search input (name/description)
- Category multi-select UI (checkbox list recommended)
- Brand multi-select UI (checkbox list recommended)
- Tag multi-select UI (checkbox list recommended)
- Price min/max inputs
- Sort dropdown:
  - Most popular
  - Rating
  - Price low → high
  - Price high → low
- Applied filters display and a Clear filters button

Product card display:
Each product card should show:
- Image
- Name
- Price
- Category + brand
- Rating
- Popularity indicator (e.g., “Bought: X” if popularity is provided)

---

## 8) App Entry

frontend/src/App.tsx should render the catalog page:

import CatalogPage from "./pages/CatalogPage";

export default function App() {
  return <CatalogPage />;
}

---

## 9) Run Locally

Two terminals:

Terminal A (backend):
cd e_commerce_app/backend
npm run dev

Terminal B (frontend):
cd e_commerce_app/frontend
npm run dev

Open the Vite URL (usually http://localhost:5173).

---

## Backend Contract Assumption

Frontend expects:

GET /api/products
- Query params:
  - q (string)
  - category (repeatable, multi-select)
  - brand (repeatable, multi-select)
  - tags (repeatable, multi-select)
  - minPrice (number)
  - maxPrice (number)
  - sort in { price_asc, price_desc, rating_desc, popular_desc }
- Response JSON:
  - { "items": Product[] }
- Each Product may include popularity (number) for indicator + popular sorting.

If backend uses different parameter names or response shape, update api/products.ts accordingly.
