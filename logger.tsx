import {
    Context,
    getOriginalOptions,
    NextFunction,
    RetHandler,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts"; // 导入ConnInfo类型
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
    const connInfo: ConnInfo = getOriginalOptions(context);
    console.log(
        JSON.stringify(
            {
                connInfo,
                request: {
                    url,
                    method,
                    headers: Object.fromEntries(headers),
                },
            },
            null,
            4
        )
    );

    await next();
    const { response } = context;
    console.log(
        JSON.stringify(
            {
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
            },
            null,
            4
        )
    );
}
