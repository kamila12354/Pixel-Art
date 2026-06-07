# Pixel Art Editor + Backend Node.js

## Wymagania

- Node.js >= 18

---

# Instalacja

```bash
npm install
```

---

# Uruchomienie

## Tryb normalny

```bash
npm start
```

## Tryb developerski (auto restart)

```bash
npm run dev
```

Serwer uruchamia się na:

```txt
http://localhost:3000
```

---

# Endpointy API

## GET /palettes

Pobiera wszystkie palety kolorów.

## GET /palettes/:id

Pobiera pojedynczą paletę.

## GET /images

Pobiera zapisane obrazki.

## POST /images

Dodaje nowy obrazek.

## DELETE /images/:id

Usuwa obrazek.

---

# Przykładowe wywołania curl

## 1. Pobranie wszystkich palet

```bash
curl http://localhost:3000/palettes
```

---

## 2. Pobranie jednej palety

```bash
curl http://localhost:3000/palettes/1
```

---

## 3. Pobranie wszystkich obrazków

```bash
curl http://localhost:3000/images
```

---

## 4. Dodanie nowego obrazka

```bash
curl -X POST http://localhost:3000/images \
-H "Content-Type: application/json" \
-d "{\"grid\":[\"red\",\"blue\",\"white\"]}"
```

---

## 5. Usunięcie obrazka

```bash
curl -X DELETE http://localhost:3000/images/ID_OBRAZKA
```

---

# Funkcjonalności

- Obsługa GET, POST i DELETE
- Parsowanie JSON body
- Obsługa błędów 400 i 404
- CORS
- Logowanie żądań
- Promise.all dla palet
- Backend bez Express
- ES Modules
- Integracja z Pixel Art Editor# Pixel-Art

# WebSocket

## Typy wiadomości

* join
* snapshot
* draw
* clear
* users
* ping
* pong
* error

## Decyzje architektoniczne

WebSocket działa na tym samym porcie co serwer HTTP (3000). Dzięki temu klient korzysta z jednego adresu serwera i nie występują dodatkowe problemy związane z konfiguracją CORS.

Serwer przechowuje wspólny stan siatki 16×16 oraz listę aktywnych użytkowników. Nowy klient po połączeniu otrzymuje pełny snapshot planszy i listę użytkowników.

Klient wykorzystuje mechanizm reconnect z rosnącym interwałem (1s, 2s, 4s, 8s, maksymalnie 10s) oraz keepalive oparty o wiadomości ping/pong.

