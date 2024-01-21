import { ConnInfo, serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";

import {
    createHandler,
    getOriginalOptions,
    logger,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";

const handler = createHandler([
    logger,
    async (ctx, next) => {
        // console.log(1);
        // await next();
        // console.log(3);
        const req = ctx.request;
        const con = getOriginalOptions(ctx);
        return handlerMain(new Request(req.url, req), con);
    },
    (ctx) => {
        // console.log(2);

        const headers = new Headers(ctx.response.headers);
        const res = new Response(ctx.response.body, {
            status: ctx.response.status,
            headers,
        });
        headers.set("Strict-Transport-Security", "max-age=31536000");
        return res;
    },
]);

async function handlerMain(
    req: Request,
    connInfo: ConnInfo
): Promise<Response> {
    const doh = Deno.env.get("doh");
    const { url, headers, method } = req;

    const pathname = new URL(url).pathname;
    if (pathname === "/dns-query" && doh?.startsWith("https://")) {
        const remoteUrl = new URL(doh);
        remoteUrl.search = new URL(url).search;
        return fetch(remoteUrl, req);
    } else {
        const data = {
            ...connInfo,
            url,
            method,
            headers: Object.fromEntries(headers),
        };

        const body = JSON.stringify(data);
        //     console.log("request", body);
        return new Response(body, {
            headers: {
                "Strict-Transport-Security": "max-age=31536000",
                "content-type": "application/json",
            },
        });
    }
}
if (import.meta.main) {
    let { port, hostname } = parse(Deno.args);
    if (port || hostname) {
        port ??= 8000;
        hostname ??= "0.0.0.0";
        await serve(handler, { port, hostname });
    } else {
        //         console.log("Listening on http://localhost:8000");

        await serve(handler, { hostname: "0.0.0.0", port: 8000 });
    }
}
