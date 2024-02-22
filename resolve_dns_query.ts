import { base64Decode } from "./base64Decode.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { get_path_name } from "./get_path_name.tsx";
import { get_ttl_min } from "./get_ttl_min.ts";
/* https://github.com/matt1/deno-nameserver */
import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import Packet from "npm:native-dns-packet@0.1.1";
// console.log(JSONSTRINGIFYNULL4({ Packet });
import Buffer from "npm:buffer@6.0.3";
import { reply_dns_query } from "./reply_dns_query.ts";
import { DNSPACKETInterface } from "./DNSPACKETInterface.ts";
// import { DNSPACKET } from "./DNSPACKET.ts";

// console.log(JSONSTRINGIFYNULL4({ Buffer });
/**
 * 解析DNS查询
 * @param ctx 上下文对象
 * @param next 下一步操作
 * @returns Promise<RetHandler>
 */
export async function resolve_dns_query(
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
            const data = base64Decode(
                new URL(url).searchParams.get("dns") ?? "",
            );
            const packet: DNSPACKETInterface = Packet.parse(
                Buffer.Buffer.from(data as Uint8Array),
            );
            const { success, result } = await reply_dns_query(packet, data);

            if (success && result?.length) {
                const ttl = get_ttl_min();
                ctx.response.body = result;
                ctx.response.status = 200;
                ctx.response.headers.set(
                    "content-type",
                    "application/dns-message",
                );
                ctx.response.headers.set("cache-control", "max-age=" + ttl);
                return;
            } else {
                return next();
            }
            // console.log(
            //     JSONSTRINGIFYNULL4({ request: { packet, data: data } }, null, 4),
            // );
        } else if (
            ctx.request.method === "POST" &&
            req.headers.get("content-type") === "application/dns-message"
        ) {
            const body = req.body && (await bodyToBuffer(req.body));
            req.body = body;

            if (body?.length) {
                const packet: DNSPACKETInterface = Packet.parse(
                    Buffer.Buffer.from(body as Uint8Array),
                );
                const { success, result } = await reply_dns_query(
                    packet,
                    body as Uint8Array,
                );

                if (success && result?.length) {
                    const ttl = get_ttl_min();
                    ctx.response.body = result;
                    ctx.response.status = 200;
                    ctx.response.headers.set(
                        "content-type",
                        "application/dns-message",
                    );
                    ctx.response.headers.set("cache-control", "max-age=" + ttl);
                    return;
                } else {
                    return next();
                }
                // console.log(
                //     JSONSTRINGIFYNULL4(
                //         { request: { packet, data: body } },
                //         null,
                //         4,
                //     ),
                // );
                // console.log();
                // console.log(JSONSTRINGIFYNULL4({ packet });
            }
        }
        // const res = await next();

        // if (
        //     res.status === 200 &&
        //     res.headers.get("content-type") === "application/dns-message"
        // ) {
        //     const resbody = res.body && (await bodyToBuffer(res.body));
        //     res.body = resbody;

        //     if (resbody?.length) {
        //         const packet = Packet.parse(
        //             Buffer.Buffer.from(resbody as Uint8Array),
        //         );
        //         // console.log(
        //         //     JSONSTRINGIFYNULL4(
        //         //         { response: { packet, data: resbody } },
        //         //         null,
        //         //         4,
        //         //     ),
        //         // );
        //         // console.log(JSONSTRINGIFYNULL4({ resbody });

        //         // console.log(JSONSTRINGIFYNULL4({ packet });
        //     }
        // }
        await next();
        return;
    } else {
        return await next();
    }
}
