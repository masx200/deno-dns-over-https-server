import {
    Context,
    getOriginalOptions,
    NextFunction,
    RetHandler,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";

/**
 * 日志记录中间件
 *
 * @param context 请求上下文
 * @param next 下一个中间件函数
 * @returns 返回一个Promise，最终处理结果
 */
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
