import http from "http";
import { handleRoutes } from "./routes.js";
import { logRequest } from "./logger.js";
import { WebSocketServer } from "ws";

const PORT = 3000;

const gridState = Array(16 * 16).fill("#ffffff");

const users = new Map();

const server = http.createServer(async (req, res) => {

    const startTime = Date.now();

    const originalWriteHead = res.writeHead;

    res.writeHead = function(statusCode, headers) {

        logRequest(req, statusCode, startTime);

        return originalWriteHead.call(this, statusCode, headers);
    };

    await handleRoutes(req, res);
});

// Utworzenie serwera WebSocket działającego obok serwera HTTP
const wss = new WebSocketServer({ server });

// Wysyłanie pojedynczej wiadomości do klienta
function send(ws, data) {

    // Sprawdzenie czy połączenie jest aktywne
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// Rozgłaszanie wiadomości do wszystkich klientów
function broadcast(data, except = null) {

    const message = JSON.stringify(data);

    wss.clients.forEach(client => {

        // Pominięcie wybranego klienta oraz sprawdzenie stanu połączenia
        if (
            client !== except &&
            client.readyState === client.OPEN
        ) {
            client.send(message);
        }
    });
}

// Obsługa nowego połączenia klienta
wss.on("connection", ws => {

    console.log(
        `Połączono klienta. Aktywnych: ${wss.clients.size}`
    );

    // Flaga używana przez mechanizm keepalive
    ws.isAlive = true;

    // Wysłanie pełnego stanu planszy oraz listy użytkowników
    send(ws, {
        type: "snapshot",
        grid: gridState,
        users: [...users.values()]
    });

    // Otrzymanie odpowiedzi pong od klienta
    ws.on("pong", () => {
        ws.isAlive = true;
    });

    // Obsługa wiadomości przychodzących od klienta
    ws.on("message", raw => {

        let msg;

        try {

            // Parsowanie wiadomości JSON
            msg = JSON.parse(raw);

        } catch {

            // Błędny format wiadomości
            return send(ws, {
                type: "error",
                message: "Niepoprawny JSON"
            });
        }

        // Centralny dispatcher wiadomości
        switch (msg.type) {

            case "join":

                // Dodanie użytkownika do listy aktywnych klientów
                users.set(ws, msg.nick || "Anonim");

                // Aktualizacja listy użytkowników u wszystkich klientów
                broadcast({
                    type: "users",
                    users: [...users.values()]
                });

                break;

            case "draw":

                // Walidacja indeksu komórki
                if (
                    typeof msg.index !== "number" ||
                    msg.index < 0 ||
                    msg.index >= 256
                ) {
                    return;
                }

                // Walidacja koloru w formacie HEX
                if (
                    !/^#[0-9A-Fa-f]{6}$/.test(msg.color)
                ) {
                    return;
                }

                // Aktualizacja wspólnego stanu planszy
                gridState[msg.index] = msg.color;

                // Rozgłoszenie zmiany do wszystkich klientów
                broadcast({
                    type: "draw",
                    index: msg.index,
                    color: msg.color
                });

                break;

            case "clear":

                // Wyczyszczenie całej planszy
                gridState.fill("#ffffff");

                // Rozgłoszenie operacji czyszczenia
                broadcast({
                    type: "clear"
                });

                break;

            case "ping":

                // Odpowiedź keepalive
                send(ws, {
                    type: "pong"
                });

                break;

            default:

                // Obsługa nieznanego typu wiadomości
                send(ws, {
                    type: "error",
                    message: "Nieznany typ wiadomości"
                });
        }
    });

    // Obsługa rozłączenia klienta
    ws.on("close", () => {

        // Usunięcie użytkownika z listy aktywnych
        users.delete(ws);

        // Aktualizacja listy użytkowników u pozostałych klientów
        broadcast({
            type: "users",
            users: [...users.values()]
        });

        console.log(
            `Rozłączono klienta. Aktywnych: ${wss.clients.size}`
        );
    });
});

// Mechanizm keepalive sprawdzający aktywność klientów
setInterval(() => {

    wss.clients.forEach(ws => {

        // Brak odpowiedzi oznacza zerwane połączenie
        if (!ws.isAlive) {
            return ws.terminate();
        }

        // Oczekiwanie na odpowiedź pong
        ws.isAlive = false;

        // Wysłanie pakietu ping
        ws.ping();
    });

}, 30000);

server.listen(PORT, () => {
    console.log(`Server działa na porcie ${PORT}`);
});