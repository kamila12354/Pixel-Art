import { palettes, images } from "./data.js";
import { sendJson, parseBody } from "./utils.js";
import { nanoid } from "nanoid";

export async function handleRoutes(req, res) {

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });

        return res.end();
    }

    if (req.method === "GET" && url.pathname === "/palettes") {
        return sendJson(res, 200, palettes);
    }

    if (req.method === "GET" &&
        url.pathname.startsWith("/palettes/")) {

        const id = Number(url.pathname.split("/")[2]);

        const palette = palettes.find(p => p.id === id);

        if (!palette) {
            return sendJson(res, 404, {
                error: "Palette not found"
            });
        }

        return sendJson(res, 200, palette);
    }

    if (req.method === "GET" && url.pathname === "/images") {
        return sendJson(res, 200, images);
    }

    if (req.method === "GET" &&
        url.pathname.startsWith("/images/")) {

        const id = url.pathname.split("/")[2];

        const image = images.find(img => img.id === id);

        if (!image) {
            return sendJson(res, 404, {
                error: "Image not found"
            });
        }

        return sendJson(res, 200, image);
    }

    if (req.method === "POST" &&
        url.pathname === "/images") {

        try {

            const body = await parseBody(req);

            const newImage = {
                id: nanoid(),
                grid: body.grid || []
            };

            images.push(newImage);

            return sendJson(res, 201, newImage);

        } catch (error) {

            return sendJson(res, 400, {
                error: error.message
            });
        }
    }

    if (req.method === "DELETE" &&
        url.pathname.startsWith("/images/")) {

        const id = url.pathname.split("/")[2];

        const index = images.findIndex(img => img.id === id);

        if (index === -1) {
            return sendJson(res, 404, {
                error: "Image not found"
            });
        }

        images.splice(index, 1);

        return sendJson(res, 200, {
            message: "Deleted"
        });
    }

    return sendJson(res, 404, {
        error: "Not found"
    });
}