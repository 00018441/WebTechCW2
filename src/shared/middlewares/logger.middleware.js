import { promises as fs } from "fs";
import path, { relative } from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const logFilePath = path.join(import.meta.dirname, "../../run.log");

const CALL_SITE_IDX = 2;

function getCallerInfo(isLoggedWrapped) {
    // save the prepareStackTrace func
    const originalStackTrace = Error.prepareStackTrace;
    // override the behavior to return arr of CallSite objects
    Error.prepareStackTrace = (_, stack) => stack;
    const err = new Error();
    const stack = err.stack;
    // restore the func with original
    Error.prepareStackTrace = originalStackTrace;

    const caller = stack[CALL_SITE_IDX + isLoggedWrapped];
    const file = fileURLToPath(caller.getFileName());
    const relativePath = relative(process.cwd(), file);

    return {
        file: relativePath,
        line: caller.getLineNumber(),
    };
}

function log(level, text, req = null) {
    const timestamp = new Date().toISOString();
    const method = req?.method || "";
    const endpoint = req?.originalUrl || "";
    const requestBody = JSON.stringify(req?.body) || "";
    // nice to have for tracing
    const requestId = req?.requestId || "";
    const { file, line } = getCallerInfo(Boolean(req));

    const logEntry = `tskv\ttimestamp=${timestamp}\tlevel=${level}\trequest_id=${requestId}\tmethod=${method}\turi=${endpoint}\tbody=${requestBody}\tfile=${file}\tline=${line}\ttext="${text}"\n`;

    console.log(logEntry.trim());
    fs.appendFile(logFilePath, logEntry).catch(console.error);
}

function requestLogger(req, _res, next) {
    req.requestId = uuid();

    req.logger = {
        info: (text) => log("INFO", text, req),
        warn: (text) => log("WARN", text, req),
        debug: (text) => log("DEBUG", text, req),
        error: (text) => log("ERROR", text, req),
    };
    next();
}

export { log, requestLogger };
