import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";

/**
 * Strict_Transport_Security 中间件函数，用于设置响应头中的 Strict-Transport-Security 字段
 * @param ctx 请求上下文对象
 * @param next 下一个中间件函数
 * @returns Promise<Response> 响应对象
 */
export async function Strict_Transport_Security(
    ctx: Context,
    next: NextFunction,
): Promise<RetHandler> {
    // console.log(2);
    await next();
    const headers = new Headers(ctx.response.headers);

    headers.append("Strict-Transport-Security", "max-age=31536000");
    // console.log(ctx.response.body);
    const res2 = ctx.response;
    // console.log("Strict_Transport_Security", res2.body);
    // console.log(res2.body);
    // 必须把响应的主体转换为Uint8Array才行
    if (!res2.body?.locked) {
        const body = ctx.response.body &&
            (await bodyToBuffer(ctx.response.body));
        // headers.delete("content-length");
        const res = new Response(body, {
            status: ctx.response.status,
            headers,
        });
        return res;
    } else {
        res2.headers = headers;
        return res2;
        // const res = new Response(res2.body, {
        //     status: ctx.response.status,
        //     headers,
        // });
        // return res;
    }
}
