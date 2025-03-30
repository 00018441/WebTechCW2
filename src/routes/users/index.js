import Router from "express-promise-router";
import { query } from "#db/index.js";

const router = new Router();

router.get("/", async (req, res) => {
    req.logger.info("start handling");
    const { rows } = await query("SELECT NOW()");
    res.status(200).send(rows[0]);
});

export default router;
