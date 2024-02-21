import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { get_path_name } from "./get_path_name.tsx";
import Packet from "npm:native-dns-packet@0.1.1";
// console.log(JSON.stringify({ Packet });
import Buffer from "npm:buffer@6.0.3";
import { base64Decode } from "./base64Decode.tsx";
// console.log(JSON.stringify({ Buffer });

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
            const data = base64Decode(
                new URL(url).searchParams.get("dns") ?? "",
            );
            const packet = Packet.parse(Buffer.Buffer.from(data as Uint8Array));

            console.log(
                JSON.stringify({ request: { packet, data: data } }, null, 4),
            );
        } else if (
            ctx.request.method === "POST" &&
            req.headers.get("content-type") === "application/dns-message"
        ) {
            const body = req.body && (await bodyToBuffer(req.body));
            req.body = body;

            if (body?.length) {
                const packet = Packet.parse(
                    Buffer.Buffer.from(body as Uint8Array),
                );

                console.log(
                    JSON.stringify(
                        { request: { packet, data: body } },
                        null,
                        4,
                    ),
                );
                // console.log();
                // console.log(JSON.stringify({ packet });
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
                    JSON.stringify(
                        { response: { packet, data: resbody } },
                        null,
                        4,
                    ),
                );
                // console.log(JSON.stringify({ resbody });

                // console.log(JSON.stringify({ packet });
            }
        }
        return;
    } else {
        return await next();
    }
}
