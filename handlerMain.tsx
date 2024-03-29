import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts"; // 导入ConnInfo类型
// import { replyInformation } from "./replyInformation.tsx"; // 导入replyInformation函数
import { proxyDnsOverHttps } from "./proxyDnsOverHttps.tsx"; // 导入proxyDnsOverHttps函数
import { proxyCheckerDoh } from "./proxyCheckerDoh.tsx"; // 导入proxyCheckerDoh函数
import { get_path_name } from "./get_path_name.tsx";
import {
    Context,
    getOriginalOptions,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { get_doh_url } from "./get_doh_url.tsx";

/**
 * 处理请求的函数
 *
 * @param req 请求对象
 * @param connInfo 连接信息
 * @returns Promise<Response> 响应对象
 */
export async function handlerMain(
    ctx: Context,
    // req: Request,
    // connInfo: ConnInfo,
    next: NextFunction,
): Promise<RetHandler> {
    const req = ctx.request;
    // console.log("connInfo", connInfo);
    // return new Response(new Uint8Array([44, 11, 22, 99]));
    const doh = get_doh_url(); // 获取Doh环境变量的值
    const { url } = req; // 解构赋值获取请求的url
    const connInfo: ConnInfo = getOriginalOptions(ctx);
    const pathname = get_path_name(url); // 获取url的路径名
    if (
        doh &&
        proxyCheckerDoh(pathname, doh) &&
        (ctx.request.method === "POST" || ctx.request.method === "GET")
    ) {
        // 判断是否存在Doh并且路径名满足代理检查条件
        return await proxyDnsOverHttps(doh, /* url */ req, connInfo); // 使用代理进行DNS-over-HTTPS请求
    } else {
        return await next();
        // return replyInformation(req, connInfo, 404); // 返回回复信息
    }
}
