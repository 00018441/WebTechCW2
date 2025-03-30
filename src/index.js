import "dotenv/config";
import { app } from "./app.js";
import { log } from "#shared/middlewares/index.js";

const PORT = process.env.NODE_PORT || 6969;

async function main() {
    app.listen(PORT, () => {
        log("INFO", `server listening on port ${PORT}`);
    });
}

main().catch((err) => {
    log("ERROR", `production is down: ${err}`);
    process.exit(1);
});
