import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";
import {
    bodyToBuffer,
    createHandler,
    getOriginalOptions,
    // bodyToBuffer,
    logger,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { handlerMain } from "./handlerMain.tsx";
export const handler = createHandler([
    logger,
    async (ctx, next): Promise<Response> => {
        // console.log(2);
        await next();
        const headers = new Headers(ctx.response.headers);

        headers.set("Strict-Transport-Security", "max-age=31536000");
        // console.log(ctx.response.body);
        //必须把响应的主体转换为Uint8Array才行
        const body = await bodyToBuffer(ctx.response.body);
        // headers.delete("content-length");
        const res = new Response(body, {
            status: ctx.response.status,
            headers,
        });
        return res;
    },
    async (ctx, next): Promise<Response> => {
        // console.log(1);
        // await next();
        // console.log(3);
        const req = ctx.request;
        const con = getOriginalOptions(ctx);
        return handlerMain(new Request(req.url, req), con);
    },
]);

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
