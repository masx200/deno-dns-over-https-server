import { get_path_name } from "./get_path_name.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { Context } from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";

/**
 * 判断是否应该缓存请求和响应
 * @param {Context} ctx - 请求上下文对象
 * @returns {boolean} - 返回一个布尔值，表示是否应该缓存请求和响应
 */
export function should_cache_request_response(ctx: Context): boolean {
    return (
        (ctx.request.method === "POST" || ctx.request.method === "GET") &&
        get_path_name(ctx.request.url) === dns_query_path_name() &&
        ctx.response.status === 200
    );
}
