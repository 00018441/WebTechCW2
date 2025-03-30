import { promises as fs } from "fs";
import path from "path";

const logFilePath = path.join(import.meta.dirname, "../../run.log");

function log(level, text, req = null) {
    const timestamp = new Date().toISOString();
    const method = req?.method || "";
    const endpoint = req?.originalUrl || "";
    const requestBody = JSON.stringify(req?.body) || "";

    const logEntry = `tskv\ttimestamp=${timestamp}\tlevel=${level}\tmethod=${method}\turi=${endpoint}\tbody=${requestBody}\ttext="${text}"\n`;

    console.log(logEntry.trim());
    fs.appendFile(logFilePath, logEntry).catch(console.error);
}

function requestLogger(req, _res, next) {
    req.logger = {
        info: (text) => log("INFO", text, req),
        warn: (text) => log("WARN", text, req),
        error: (text) => log("ERROR", text, req),
    };
    next();
}

export { log, requestLogger };
