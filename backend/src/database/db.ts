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
