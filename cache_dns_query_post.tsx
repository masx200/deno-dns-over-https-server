import {
    Context,
    NextFunction,
    RetHandler,
    getOriginalOptions,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { should_cache_request_response } from "./should_cache_request_response.tsx";
import { get_dns_query_cache_key } from "./get_dns_query_cache_key.tsx";
import { get_path_name } from "./get_path_name.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { CachePromiseInterfaceFactory } from "./CachePromiseInterfaceFactory.tsx";
import { get_ttl_min } from "./get_ttl_min.ts";
import { parse } from "cache-control-parser";
import { ConnInfo } from "https://deno.land/x/masx200_deno_serve_https@1.0.6/ConnInfo.ts";

/**
 * 缓存DNS查询的POST和GET方法
 * @param {Context} ctx - 请求上下文对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<RetHandler>} - 返回一个Promise对象，用于处理请求的返回结果
 */
export async function cache_dns_query_post_and_get_method(
    ctx: Context,
    next: NextFunction
): Promise<RetHandler> {
    if (get_path_name(ctx.request.url) != dns_query_path_name()) return next();
    const identifier = `DenoCache-${new URL(ctx.request.url).hostname}`;
    const cache = await CachePromiseInterfaceFactory();
    const request_body =
        ctx.request.body &&
        new Uint8Array(
            await new Request(ctx.request.url, ctx.request)
                .clone()
                .arrayBuffer()
        );
    //@ts-ignore
    ctx.request.body = request_body;
    const cache_key = get_dns_query_cache_key({
        method: ctx.request.method,
        url: ctx.request.url,
        body: request_body,
    });

    await next();
    if (should_cache_request_response(ctx)) {
        if (!cache_key) return;

        const header_cache_control = ctx.response.headers.get("cache-control");
        // console.log(header_cache_control);
        const ttl = Math.max(
            get_ttl_min(),
            (header_cache_control &&
                parse(header_cache_control)?.["max-age"]) ??
                0
        );
        // console.log(ttl)
        await cache.set(cache_key, {
            body: ctx.response.body,
            headers: Object.fromEntries(ctx.response.headers),
            status: ctx.response.status,
            expires: Date.now() + 1000 * ttl,
        });

        ctx.response.headers.append(
            "Cache-Status",
            identifier +
                `;key=${cache_key};stored;fwd=miss;ttl=${ttl};fwd-status=${ctx.response.status}`
        );
    } else {
        return;
    }
}
