import { bodyToJSON } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/body/bodyToJSON.ts";
import { dNSRecordsInstance } from "./dNSRecordsInstance.ts";
import {
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { JSONRPCSERVER } from "./JSONRPCSERVER.tsx";
import { dns_records_path_name } from "./dns_records_path_name.tsx";
/**
 * dns_records_middleware中间件函数
 * @param context 上下文对象
 * @param next 下一个中间件函数
 * @returns Promise<RetHandler> 返回处理结果
 */
export async function dns_records_middleware(
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    // console.log("dns_records_middleware");
    if (
        new URL(context.request.url).pathname === dns_records_path_name() &&
        context.request.method.toLowerCase() == "post" &&
        context.request.headers.get("content-type")?.startsWith(
            "application/json",
        )
    ) {
        let body;
        try {
            body = await bodyToJSON(
                context.request.body,
                context.request.headers,
            );
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                body: "Bad Request",
                headers: {
                    "content-type": "text/plain",
                },
            };
        }
        const result = await JSONRPCSERVER(body, dNSRecordsInstance);
        return {
            headers: {
                "content-type": "application/json",
            },
            status: 200,
            body: JSON.stringify(
                result,
            ),
        };
    }
    await next();
    return;
}
