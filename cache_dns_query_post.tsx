import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { should_cache_request_response } from "./should_cache_request_response.tsx";
import { get_dns_query_cache_key } from "./get_dns_query_cache_key.tsx";
import { get_path_name } from "./get_path_name.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { CachePromiseInterfaceFactory } from "./CachePromiseInterfaceFactory.tsx";
import { get_ttl_min } from "./get_ttl_min.ts";
import { parse } from "@masx200/cache-control-parser";

/**
 * 缓存DNS查询的POST和GET方法
 * @param {Context} ctx - 请求上下文对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<RetHandler>} - 返回一个Promise对象，用于处理请求的返回结果
 */
export async function cache_dns_query_post_and_get_method(
    ctx: Context,
    next: NextFunction,
): Promise<RetHandler> {
    if (get_path_name(ctx.request.url) != dns_query_path_name()) return next();
    const identifier = `DenoDeployCache ${new URL(ctx.request.url).hostname}`;
    const cache = await CachePromiseInterfaceFactory();
    const request_body = ctx.request.body
        ? new Uint8Array(
            await new Request(ctx.request.url, ctx.request)
                .clone()
                .arrayBuffer(),
        )
        : null;

    ctx.request.body = request_body;
    const cache_key = get_dns_query_cache_key({
        method: ctx.request.method,
        url: ctx.request.url,
        body: request_body,
    });

    if (cache_key) {
        try {
            /* TypeError: KV reads quota is exhausted. */
            const result = await cache.get(cache_key);

            if (result) {
                // console.log(cache_key, result);
                const response_body = result.body;
                const ttl = result.ttl;
                ctx.response.status = result.status;
                ctx.response.headers = new Headers(result.headers);
                ctx.response.headers.append(
                    "Cache-Status",
                    identifier + `;key=${cache_key};hit;ttl=${ttl}`,
                );
                ctx.response.body = response_body;
                return;
            }
        } catch (error) {
            console.error(error);
            await next();
            return; // 跳过缓存处理，继续执行下一个中间件函数
        }
    }
    // deno-lint-ignore no-unused-vars
    const res = await next();
    // console.log("cache_dns_query_post_and_get_method", res.body);
    if (should_cache_request_response(ctx)) {
        if (!cache_key) return;
        try {
            const header_cache_control = ctx.response.headers.get(
                "cache-control",
            );
            // console.log(header_cache_control);
            const ttl = Math.max(
                get_ttl_min(),
                Number(
                    (header_cache_control &&
                        parse(header_cache_control)?.["max-age"]) ??
                        0,
                ),
            );
            const response_body = await bodyToBuffer(ctx.response.body);
            /* TypeError: ReadableStream is locked or disturbed */
            ctx.response.body = response_body;
            // console.log(ttl)
            /* TypeError: KV reads quota is exhausted. */
            await cache.set(cache_key, {
                headers: Object.fromEntries(ctx.response.headers),
                status: ctx.response.status,
                expires: Date.now() + 1000 * ttl,
                ttl,
                body: response_body,
            });

            ctx.response.headers.append(
                "Cache-Status",
                identifier +
                    `;key=${cache_key};stored;fwd=miss;ttl=${ttl};fwd-status=${ctx.response.status}`,
            );
            ctx.response.body = response_body;
        } catch (error) {
            console.error(error);
            return; // 跳过缓存处理，继续执行下一个中间件函数
        }
    } else {
        return;
    }
}
