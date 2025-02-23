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
import { resolve_dns_query } from "./resolve_dns_query.ts";
import { dns_records_middleware } from "./dns_records_middleware.tsx";
import { dns_records_authentication } from "./dns_records_authentication.tsx";
import { staticHandler } from "./staticHandler.tsx";
export const middlewares: Middleware[] = [
    // 错误处理中间件，捕获并处理请求链中的异常，返回500错误响应。
    error_handler, 

    // 日志记录中间件，记录请求和响应的详细信息，包括连接信息、请求URL、方法和头信息等。
    logger,

    // 设置HTTP响应头的中间件，确保所有响应都包含Strict-Transport-Security头，以增强安全性。
    Strict_Transport_Security,

    // 防止环路产生的中间件，通过解析Forwarded头来检测是否存在循环转发的情况，避免潜在的安全风险。
    loop_detection_prevent_forwarded,

    // 解析DNS消息的中间件，支持通过GET和POST方法传递DNS消息，并处理DNS查询和响应。
    parse_dns_message,

    // 设置缓存控制的最大年龄大于指定最小值的中间件，确保缓存时间符合要求。
    dns_query_set_cache_control_max_age_greater_than,

    // 缓存DNS查询的POST和GET方法的中间件，优先从缓存中读取DNS数据解析，缓存过期再重新查询。
    cache_dns_query_post_and_get_method,

    // 解析DNS查询的中间件，处理DNS查询请求并返回相应的DNS响应。
    resolve_dns_query,

    // 使用DNS记录进行身份验证的中间件，确保只有授权用户可以访问特定路径。
    dns_records_authentication,

    // DNS记录中间件，处理与DNS记录相关的请求，如创建、更新和删除DNS记录。
    dns_records_middleware,

    // 主要的中间件，处理核心业务逻辑，根据请求路径和方法执行相应的操作。
    mainMiddleware,

    // 静态文件处理中间件，用于提供静态资源文件（如HTML、CSS、JS等）的服务。
    staticHandler,
];