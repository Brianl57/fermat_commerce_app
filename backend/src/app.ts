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
