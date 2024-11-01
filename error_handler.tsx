// 导入Middleware类型
import {
    Context,
    // Middleware,
    NextFunction,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
// 导入STATUS_TEXT
import { STATUS_TEXT } from "https://deno.land/std@0.189.0/http/http_status.ts";

// 定义error_handler为Middleware类型
export async function error_handler(
    _ctx: Context,
    next: NextFunction,
): Promise<Response | undefined> {
    try {
        // 调用next()函数
        await next();
    } catch (error) {
        // 打印错误信息
        console.error(error);
        // 返回500错误响应
        return new Response(`${STATUS_TEXT[500]}` + "\n" + String(error), {
            status: 500,
        });
    }
}
