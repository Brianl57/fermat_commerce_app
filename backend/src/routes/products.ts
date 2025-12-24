import { Router } from "express";
import { listProducts, getFilterOptions } from "../services/products.service";

export const productsRouter = Router();

productsRouter.get("/filters", async (_req, res) => {
    try {
        const filters = await getFilterOptions();
        res.json(filters);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

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
