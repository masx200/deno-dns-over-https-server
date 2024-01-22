import { error_handler } from "./error_handler.tsx";
import { mainMiddleware } from "./mainMiddleware.tsx";
import { Strict_Transport_Security } from "./Strict_Transport_Security.tsx";
import {
    // bodyToBuffer,  // 用于将请求体转换为Buffer对象的中间件
    logger, // 日志记录中间件
    Middleware, // 中间件的接口
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { dns_query_set_cache_control_max_age_greater_than } from "./dns_query_set_cache_control_max_age_greater_than.tsx";

export const middlewares: Middleware[] = [
    dns_query_set_cache_control_max_age_greater_than,
    error_handler, // 错误处理中间件
    logger, // 日志记录中间件
    Strict_Transport_Security, // 设置HTTP响应头的中间件
    mainMiddleware, // 主要的中间件
];
