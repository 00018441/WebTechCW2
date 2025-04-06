import { promises as fs } from "node:fs";
import path, { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getContext } from "./request-context.middleware.js";

const logFilePath = path.join(import.meta.dirname, "../../run.log");

const CALL_SITE_IDX = 2;

function getCallerInfo(isLoggerWrapped) {
    // save the prepareStackTrace func
    const originalStackTrace = Error.prepareStackTrace;
    // override the behavior to return arr of CallSite objects
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    const stack = err.stack;
    // restore the func with original
    Error.prepareStackTrace = originalStackTrace;

    const caller = stack[CALL_SITE_IDX + isLoggerWrapped];
    const file = fileURLToPath(caller.getFileName());
    const relativePath = relative(process.cwd(), file);

    return {
        file: relativePath,
        line: caller.getLineNumber(),
    };
}

function log(level, text, req = null) {
    const timestamp = new Date().toISOString();
    const requestBody = JSON.stringify(req?.body) || "{}";
    const { file, line } = getCallerInfo(Boolean(req));

    const context = getContext();
    const requestId = context.requestId || "";
    const method = context.method || "";
    const endpoint = context.endpoint || "";

    const logEntry = `tskv\ttimestamp=${timestamp}\tlevel=${level}\trequest_id=${requestId}\tmethod=${method}\turi=${endpoint}\tbody=${requestBody}\tfile=${file}\tline=${line}\ttext=${text}\n`;

    console.log(logEntry.trim().replace(/\t/g, "      "));
    fs.appendFile(logFilePath, logEntry).catch(console.error);
}

function requestLogger(req, _res, next) {
    req.logger = {
        info: (text) => log("INFO", text, req),
        warn: (text) => log("WARN", text, req),
        debug: (text) => log("DEBUG", text, req),
        error: (text) => log("ERROR", text, req),
    };
    next();
}

export { log, requestLogger };
