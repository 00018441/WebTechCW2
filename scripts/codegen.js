import fs from "fs";
import path from "path";
import { convertToCamelCase } from "#shared/utils/index.js";

const __dirname = import.meta.dirname;
const inputDir = path.join(__dirname, "../src/db/sql");
const outputFile = path.join(__dirname, "../src/db/sql-queries.js");

function generateQueryFile() {
    try {
        const files = fs
            .readdirSync(inputDir)
            .filter((file) => file.endsWith(".sql"));

        const queries = {};
        files.forEach((file) => {
            const key = `k${convertToCamelCase(file.slice(0, -4))}`;
            const sql = fs
                .readFileSync(path.join(inputDir, file), "utf8")
                .trim();
            queries[key] = sql;
        });

        const strContent = `export const sqlQueries = ${JSON.stringify(queries, null, 4)};\n`;

        fs.writeFileSync(outputFile, strContent, "utf8");
        console.log(`SQL queries generated to: ${outputFile}`);
    } catch (err) {
        console.error("error generating SQL queries:", err);
    }
}

generateQueryFile();
