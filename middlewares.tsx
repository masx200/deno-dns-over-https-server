import { error_handler } from "./error_handler.tsx";
import { mainMiddleware } from "./mainMiddleware.tsx";
import { Strict_Transport_Security } from "./Strict_Transport_Security.tsx";
import {
    // bodyToBuffer,  // 用于将请求体转换为Buffer对象的中间件
    // logger, // 日志记录中间件
    Middleware, // 中间件的接口
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { dns_query_set_cache_control_max_age_greater_than } from "./dns_query_set_cache_control_max_age_greater_than.tsx";
import { logger } from "./logger.tsx";
import { cache_dns_query_post_and_get_method } from "./cache_dns_query_post.tsx";
import { loop_detection_prevent_forwarded } from "./loop_detection_prevent_forwarded.ts";
import { parse_dns_message } from "./parse_dns_message.tsx";
export const middlewares: Middleware[] = [
    error_handler, // 错误处理中间件
    logger, // 日志记录中间件
    loop_detection_prevent_forwarded,
    cache_dns_query_post_and_get_method,
    dns_query_set_cache_control_max_age_greater_than,

    Strict_Transport_Security, // 设置HTTP响应头的中间件
    parse_dns_message,
    mainMiddleware, // 主要的中间件
];
