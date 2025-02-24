import { bodyToBuffer } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { fetchDebug } from "./fetchDebug.tsx";
import { STATUS_TEXT } from "https://deno.land/std@0.189.0/http/http_status.ts";
import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";
import { RequestOptions } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/src/Context.ts";
import { base64Encode } from "./base64Encode.tsx";
import { CacheStoragefetchDebug } from "./CacheStoragefetchDebug.tsx";
import { get_ttl_min } from "./get_ttl_min.ts";
const cachedFetch = async function (
    input: RequestInfo | URL, // 请求的URL或URL对象
    init?: RequestInit | undefined, // 请求的初始化配置，可选参数
): Promise<Response> {
    return await CacheStoragefetchDebug(
        "deno-dns-over-https-server",
        fetchDebug,
        get_ttl_min(),
        input,
        init,
    );
};
/**
 * 转发DNS over HTTPS请求的代理函数
 * @param {string} doh - DNS over HTTPS服务器的URL
 * @param {RequestOptions} req - 请求对象
 * @returns {Promise<Response>} 响应对象
 */
export async function proxyDnsOverHttps(
    doh: string,
    // url: string,
    req: RequestOptions,
    connInfo: ConnInfo,
): Promise<Response> {
    try {
        const originurl = req.url;
        const remoteUrl = new URL(doh);
        remoteUrl.search = new URL(originurl).search;
        // console.log(new Request(remoteUrl, req));
        // 必须把请求的主体转换为Uint8Array才行
        const body = req.body && (await bodyToBuffer(req.body));
        const headers = new Headers(req.headers);
        headers.append(
            "Forwarded",
            `proto=${new URL(originurl).protocol.slice(0, -1)};host=${
                new URL(originurl).hostname
            };by=${(connInfo.localAddr as Deno.NetAddr).hostname};for=${
                (connInfo.remoteAddr as Deno.NetAddr).hostname
            }`,
        );

        if (req.method === "POST" && body && body?.length) {
            const geturl = new URL(remoteUrl);

            geturl.searchParams.set("dns", base64Encode(body));
            const res2 = await cachedFetch(geturl, {
                // body,
                headers: headers,
                method: "GET",
            });
            // console.log(newLocal_1.body);
            return res2;
        }
        if (req.method !== "GET") {
            return new Response(`${STATUS_TEXT[405]}`, {
                status: 405,
            });
        } else {
            const res3 = await cachedFetch(remoteUrl, {
                body,
                headers: headers,
                method: req.method,
            });
            // console.log(newLocal.body);
            return res3;
        }
    } catch (error) {
        console.error(error);
        // 返回500错误响应
        return new Response(`${STATUS_TEXT[502]}` + "\n" + String(error), {
            status: 502,
        });
    }
}
