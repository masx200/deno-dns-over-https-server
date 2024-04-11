import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { get_path_name } from "./get_path_name.tsx";
import Packet from "npm:native-dns-packet@0.1.1";
// console.log(JSONSTRINGIFYNULL4({ Packet });
import Buffer from "npm:buffer@6.0.3";
import { base64Decode } from "./base64Decode.tsx";
import { JSONSTRINGIFYNULL4 } from "./JSONSTRINGIFYNULL4.ts";
// console.log(JSONSTRINGIFYNULL4({ Buffer });
/**
 * 解析DNS消息。
 * 此函数用于处理DNS查询和响应的消息，支持通过GET和POST方法传递DNS消息。
 *
 * @param ctx 上下文对象，包含请求和响应的信息。
 * @param next 中间件的下一个函数，用于继续处理请求链。
 * @returns 返回一个Promise，解析为处理结果的RetHandler对象。
 */
export async function parse_dns_message(
    ctx: Context,
    next: NextFunction,
): Promise<RetHandler> {
    const req = ctx.request;
    const { url } = req;
    const pathname = get_path_name(url);
    if (
        pathname === dns_query_path_name() &&
        (ctx.request.method === "POST" || ctx.request.method === "GET")
    ) {
        if (
            ctx.request.method === "GET" &&
            new URL(url).searchParams.get("dns")?.length
        ) {
            try {
                const data = base64Decode(
                    new URL(url).searchParams.get("dns") ?? "",
                );
                const packet = Packet.parse(
                    Buffer.Buffer.from(data as Uint8Array),
                );

                console.log(
                    JSONSTRINGIFYNULL4(
                        { request: { packet, data: data } },
                        null,
                        4,
                    ),
                );
            } catch (error) {
                console.error(error);
                return new Response(
                    "bad request\ninvalid dns message\n" + String(error),
                    { status: 400 },
                );
            }
        } else if (
            ctx.request.method === "POST" &&
            req.headers.get("content-type") === "application/dns-message"
        ) {
            const body = req.body && (await bodyToBuffer(req.body));
            req.body = body;

            if (body?.length) {
                try {
                    const packet = Packet.parse(
                        Buffer.Buffer.from(body as Uint8Array),
                    );

                    console.log(
                        JSONSTRINGIFYNULL4(
                            { request: { packet, data: body } },
                            null,
                            4,
                        ),
                    );
                    // console.log();
                    // console.log(JSONSTRINGIFYNULL4({ packet });
                } catch (error) {
                    console.error(error);
                    return new Response(
                        "bad request\ninvalid dns message\n" + String(error),
                        { status: 400 },
                    );
                }
            }
        }
        const res = await next();

        if (
            res.status === 200 &&
            res.headers.get("content-type") === "application/dns-message"
        ) {
            const resbody = res.body && (await bodyToBuffer(res.body));
            res.body = resbody;

            if (resbody?.length) {
                const packet = Packet.parse(
                    Buffer.Buffer.from(resbody as Uint8Array),
                );
                console.log(
                    JSONSTRINGIFYNULL4(
                        { response: { packet, data: resbody } },
                        null,
                        4,
                    ),
                );
                // console.log(JSONSTRINGIFYNULL4({ resbody });

                // console.log(JSONSTRINGIFYNULL4({ packet });
            }
        }
        return;
    } else {
        return await next();
    }
}
