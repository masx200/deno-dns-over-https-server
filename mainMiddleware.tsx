import {
    Context,
    // getOriginalOptions,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { handlerMain } from "./handlerMain.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { get_path_name } from "./get_path_name.tsx";

/**
 * 中间件函数，用于处理请求
 * @param {Context} context - 请求上下文对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<Response>} - 响应对象
 */
export async function mainMiddleware(
    context: Context,
    next: NextFunction
): Promise<RetHandler> {
    // console.log(1);
    // await next();
    // console.log(3);
    // const req = ctx.request;
    if (get_path_name(context.request.url) != dns_query_path_name())
        return next();

    return await handlerMain(context, /* con, */ next);
}
