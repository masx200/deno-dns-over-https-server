import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts"; // 导入ConnInfo类型
// import { replyInformation } from "./replyInformation.tsx"; // 导入replyInformation函数
import { proxyDnsOverHttps } from "./proxyDnsOverHttps.tsx"; // 导入proxyDnsOverHttps函数
import { proxyCheckerDoh } from "./proxyCheckerDoh.tsx"; // 导入proxyCheckerDoh函数
import { get_path_name } from "./get_path_name.tsx";
import {
    Context,
    getOriginalOptions,
    NextFunction,
    // RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { get_doh_url } from "./get_doh_url.tsx";
import { ArrayShuffle } from "./ArrayShuffle.ts";
import { ResponseOptions } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/src/Context.ts";
import { dns_query_path_name } from "./dns_query_path_name.tsx";

/**
 * 处理请求的函数
 *
 * @param req 请求对象
 * @param connInfo 连接信息
 * @returns Promise<Response> 响应对象
 */
export async function handlerMain(
    context: Context,
    // req: Request,
    // connInfo: ConnInfo,
    next: NextFunction,
): Promise<Response | ResponseOptions> {
    const req = context.request;
    const url = req.url;

    /* 如果不是dns请求,则直接返回写一个中间件 */
    if (
        !(get_path_name(context.request.url) == dns_query_path_name() &&
                (req.method === "POST" && req.headers.get("content-type") ===
                        "application/dns-message") ||
            (req.method === "GET" &&
                new URL(url).searchParams.get("dns")?.length))
    ) return next();
    // console.log("connInfo", connInfo);
    // return new Response(new Uint8Array([44, 11, 22, 99]));
    /* 需要负载均衡了,如果上游服务器响应失败,则切换下一个服务器 */
    const dohs = get_doh_url(); // 获取Doh环境变量的值

    if (dohs.length == 1) {
        const doh = dohs[0];
        const { url } = req; // 解构赋值获取请求的url
        const connInfo: ConnInfo = getOriginalOptions(context);
        const pathname = get_path_name(url); // 获取url的路径名
        if (
            doh &&
            proxyCheckerDoh(pathname, doh) &&
            (context.request.method === "POST" ||
                context.request.method === "GET")
        ) {
            // 判断是否存在Doh并且路径名满足代理检查条件
            return await proxyDnsOverHttps(doh, /* url */ req, connInfo); // 使用代理进行DNS-over-HTTPS请求
        } else {
            return await next();
            // return replyInformation(req, connInfo, 404); // 返回回复信息
        }
    } else {
        const errors = Array<string>();
        for (const doh of ArrayShuffle(dohs)) {
            //const doh = dohs[0];
            const { url } = req; // 解构赋值获取请求的url
            const connInfo: ConnInfo = getOriginalOptions(context);
            const pathname = get_path_name(url); // 获取url的路径名
            if (
                doh &&
                proxyCheckerDoh(pathname, doh) &&
                (context.request.method === "POST" ||
                    context.request.method === "GET")
            ) {
                // 判断是否存在Doh并且路径名满足代理检查条件
                const response = await proxyDnsOverHttps(
                    doh,
                    /* url */ req,
                    connInfo,
                ); // 使用代理进行DNS-over-HTTPS请求
                if (
                    response.ok &&
                    response.headers.get("content-type") ===
                        "application/dns-message"
                ) {
                    return response;
                } else {
                    console.error(
                        `${doh} ${response.status} ${response.statusText}`,
                    );
                    errors.push(
                        `${doh} ${response.status} ${response.statusText}`,
                    );
                    continue;
                }
            } else {
                return await next();
                // return replyInformation(req, connInfo, 404); // 返回回复信息
            }
        }
        return new Response(
            "all doh server response failed\n" + errors.join("\n"),
            {
                status: 502,
            },
        );
    }
}
