import {
    Context,
    getOriginalOptions,
    NextFunction,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { handlerMain } from "./handlerMain.tsx";

/**
 * 中间件函数，用于处理请求
 * @param {Context} ctx - 请求上下文对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<Response>} - 响应对象
 */
export async function mainMiddleware(
    ctx: Context,
    next: NextFunction
): Promise<Response> {
    // console.log(1);
    // await next();
    // console.log(3);
    const req = ctx.request;
    const con = getOriginalOptions(ctx);
    return await handlerMain(new Request(req.url, req), con, next);
}
