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
