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
