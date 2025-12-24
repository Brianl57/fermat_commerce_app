import express from "express";
import cors from "cors";
import { initDb } from "./db";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  await initDb();

  app.get("/health", (_req, res) => res.json({ ok: true }));

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => console.log(`Listening to backend server on port: ${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
