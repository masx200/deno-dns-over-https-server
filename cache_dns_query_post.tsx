import {
    Context,
    NextFunction,
    RetHandler,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { should_cache_request_response } from "./should_cache_request_response.tsx";
import { get_dns_query_cache_key } from "./get_dns_query_cache_key.tsx";
import { get_path_name } from "./get_path_name.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { CachePromiseInterfaceFactory } from "./CachePromiseInterfaceFactory.tsx";
import { get_ttl_min } from "./get_ttl_min.ts";
import { parse } from "cache-control-parser";

/**
 * 缓存DNS查询的POST和GET方法
 * @param {Context} context - 请求上下文对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<RetHandler>} - 返回一个Promise对象，用于处理请求的返回结果
 */
export async function cache_dns_query_post_and_get_method(
    context: Context,
    next: NextFunction
): Promise<RetHandler> {
    if (get_path_name(context.request.url) != dns_query_path_name())
        return next();
    const cache = await CachePromiseInterfaceFactory();
    const request_body =
        context.request.body &&
        new Uint8Array(
            await new Request(context.request.url, context.request)
                .clone()
                .arrayBuffer()
        );
    //@ts-ignore
    context.request.body = request_body;
    const cache_key = get_dns_query_cache_key({
        method: context.request.method,
        url: context.request.url,
        body: request_body,
    });

    await next();
    if (should_cache_request_response(context)) {
        if (!cache_key) return;

        const header_cache_control =
            context.response.headers.get("cache-control");
        // console.log(header_cache_control);
        const ttl = Math.max(
            get_ttl_min(),
            (header_cache_control &&
                parse(header_cache_control)?.["max-age"]) ??
                0
        );
        // console.log(ttl)
        await cache.set(cache_key, {
            body: context.response.body,
            headers: Object.fromEntries(context.response.headers),
            status: context.response.status,
            expires: Date.now() + 1000 * ttl,
        });
        context.response.headers.append(
            "Cache-Status",
            `DenoDeployCache;key=${cache_key};stored;fwd=miss;ttl=${ttl};fwd-status=${context.response.status}`
        );
    } else {
        return;
    }
}
