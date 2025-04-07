import pg from "pg";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

const __dirname = import.meta.dirname;
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runMigrations() {
    const migrationsPath = join(__dirname, "../postgresql/migrations");
    const migrationFiles = readdirSync(migrationsPath).filter((file) => file.endsWith(".sql"));

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const file of migrationFiles) {
            const filePath = join(migrationsPath, file);
            const sql = readFileSync(filePath, "utf8");
            console.log(`running migration: ${file}`);

            const { rowCount } = await client.query(
                `INSERT INTO public.migrations (filename)
                VALUES ($1) ON CONFLICT DO NOTHING`,
                [file],
            );

            if (rowCount === 1) {
                await client.query(sql);
            } else {
                console.log(`Migration ${file} already applied, skipping...`);
            }
        }

        await client.query("COMMIT");
        console.log("migrations applied successfully");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(`migrations failed:`, err.message);
    } finally {
        client.release();
    }
}

runMigrations();
