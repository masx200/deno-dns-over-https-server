import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";
import { bodyToBuffer } from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { fetchDebug } from "./fetchDebug.tsx";

export async function handlerMain(
    req: Request,
    connInfo: ConnInfo,
): Promise<Response> {
    // return new Response(new Uint8Array([44, 11, 22, 99]));
    const doh = Deno.env.get("doh");
    const { url, headers, method } = req;

    const pathname = new URL(url).pathname;
    if (pathname === "/dns-query" && doh?.startsWith("https://")) {
        const remoteUrl = new URL(doh);
        remoteUrl.search = new URL(url).search;
        // console.log(new Request(remoteUrl, req));
        //必须把请求的主体转换为Uint8Array才行
        const body = await bodyToBuffer(req.body);
        return fetchDebug(remoteUrl, {
            body,
            headers: req.headers,
            method: req.method,
        });
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
