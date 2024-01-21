import {
    bodyToBuffer,
    Context,
    NextFunction,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";

export const Strict_Transport_Security = async (
    ctx: Context,
    next: NextFunction
): Promise<Response> => {
    // console.log(2);
    await next();
    const headers = new Headers(ctx.response.headers);

    headers.set("Strict-Transport-Security", "max-age=31536000");
    // console.log(ctx.response.body);
    //必须把响应的主体转换为Uint8Array才行
    const body = ctx.response.body && (await bodyToBuffer(ctx.response.body));
    // headers.delete("content-length");
    const res = new Response(body, {
        status: ctx.response.status,
        headers,
    });
    return res;
};
