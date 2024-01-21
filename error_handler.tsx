// 导入Middleware类型
import { Middleware } from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
// 导入STATUS_TEXT
import { STATUS_TEXT } from "https://deno.land/std@0.189.0/http/http_status.ts";

// 定义error_handler为Middleware类型
export const error_handler: Middleware = async (_ctx, next) => {
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
};
