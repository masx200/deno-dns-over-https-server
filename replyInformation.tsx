import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";

/**
 * 回复信息函数
 *
 * @param req 请求对象
 * @param connInfo 连接信息
 * @param status 状态码
 * @returns Response 响应对象
 */
export function replyInformation(
    req: Request,
    connInfo: ConnInfo,
    status: number,
): Response {
    const { url, headers, method } = req;
    const data = {
        ...connInfo,
        url,
        method,
        headers: Object.fromEntries(headers),
    };

    const body = JSON.stringify(data);
    //     console.log("request", body);
    return new Response(body, {
        status,
        headers: {
            "Strict-Transport-Security": "max-age=31536000",
            "content-type": "application/json",
        },
    });
}
