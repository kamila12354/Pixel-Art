import http from "http";
import { handleRoutes } from "./routes.js";
import { logRequest } from "./logger.js";

const PORT = 3000;

const server = http.createServer(async (req, res) => {

    const startTime = Date.now();

    const originalWriteHead = res.writeHead;

    res.writeHead = function(statusCode, headers) {

        logRequest(req, statusCode, startTime);

        return originalWriteHead.call(this, statusCode, headers);
    };

    await handleRoutes(req, res);
});

server.listen(PORT, () => {
    console.log(`Server działa na porcie ${PORT}`);
});