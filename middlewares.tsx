import {
    // bodyToBuffer,  // 用于将请求体转换为Buffer对象的中间件
    logger, // 日志记录中间件
    Middleware, // 中间件的接口
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { error_handler } from "./error_handler.tsx"; // 错误处理中间件
import { Strict_Transport_Security } from "./Strict_Transport_Security.tsx"; // 用于设置HTTP响应头的中间件
import { mainMiddleware } from "./mainMiddleware.tsx"; // 主要的中间件

export const middlewares: Middleware[] = [
    error_handler, // 错误处理中间件
    logger, // 日志记录中间件
    Strict_Transport_Security, // 设置HTTP响应头的中间件
    mainMiddleware, // 主要的中间件
];
