import { error_handler } from "./error_handler.tsx";
import { mainMiddleware } from "./mainMiddleware.tsx";
import { Strict_Transport_Security } from "./Strict_Transport_Security.tsx";
import {
    Context,
    // bodyToBuffer,  // 用于将请求体转换为Buffer对象的中间件
    // logger, // 日志记录中间件
    Middleware,
    NextFunction,
    RetHandler,
    getOriginalOptions, // 中间件的接口
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { dns_query_set_cache_control_max_age_greater_than } from "./dns_query_set_cache_control_max_age_greater_than.tsx";

export async function logger(
    context: Context,
    next: NextFunction
): Promise<RetHandler> {
    const { request } = context;
    const { url, method, headers } = request;
    const connInfo = getOriginalOptions(context);
    console.log({
        connInfo,
        request: {
            url,
            method,
            headers: Object.fromEntries(headers),
        },
    });

    await next();
    const { response } = context;
    console.log({
        response: {
            // url: request.url,
            status: response.status,
            // method,
            headers: Object.fromEntries(response.headers),
        },
        connInfo,
        request: {
            url,
            method,
            headers: Object.fromEntries(headers),
        },
    });
}

export const middlewares: Middleware[] = [
    error_handler, // 错误处理中间件
    logger, // 日志记录中间件
    dns_query_set_cache_control_max_age_greater_than,

    Strict_Transport_Security, // 设置HTTP响应头的中间件
    mainMiddleware, // 主要的中间件
];
