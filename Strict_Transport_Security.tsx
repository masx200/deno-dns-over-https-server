import {
    bodyToBuffer,
    Context,
    NextFunction,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";

/**
 * Strict_Transport_Security 中间件函数，用于设置响应头中的 Strict-Transport-Security 字段
 * @param ctx 请求上下文对象
 * @param next 下一个中间件函数
 * @returns Promise<Response> 响应对象
 */
export async function Strict_Transport_Security(
    ctx: Context,
    next: NextFunction,
): Promise<Response> {
    // console.log(2);
    await next();
    const headers = new Headers(ctx.response.headers);

    headers.set("Strict-Transport-Security", "max-age=31536000");
    // console.log(ctx.response.body);
    // 必须把响应的主体转换为Uint8Array才行
    const body = ctx.response.body && (await bodyToBuffer(ctx.response.body));
    // headers.delete("content-length");
    const res = new Response(body, {
        status: ctx.response.status,
        headers,
    });
    return res;
}
