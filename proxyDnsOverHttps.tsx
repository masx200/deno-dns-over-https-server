import { bodyToBuffer } from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { fetchDebug } from "./fetchDebug.tsx";

export async function proxyDnsOverHttps(
    doh: string,
    url: string,
    req: Request
) {
    const remoteUrl = new URL(doh);
    remoteUrl.search = new URL(url).search;
    // console.log(new Request(remoteUrl, req));
    //必须把请求的主体转换为Uint8Array才行
    const body = req.body && (await bodyToBuffer(req.body));
    return fetchDebug(remoteUrl, {
        body,
        headers: req.headers,
        method: req.method,
    });
}
