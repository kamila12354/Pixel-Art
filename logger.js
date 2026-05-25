export function logRequest(req, status, startTime) {

    const duration = Date.now() - startTime;

    console.log(
        `${req.method} ${req.url} -> ${status} (${duration} ms)`
    );
}