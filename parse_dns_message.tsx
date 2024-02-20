import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { get_path_name } from "./get_path_name.tsx";
import Packet from "npm:native-dns-packet@0.1.1";
// console.log({ Packet });
import Buffer from "npm:buffer@6.0.3";
// console.log({ Buffer });

export async function parse_dns_message(
    ctx: Context,
    next: NextFunction
): Promise<RetHandler> {
    const req = ctx.request;
    const { url } = req;
    const pathname = get_path_name(url);
    if (
        pathname === dns_query_path_name() &&
        (ctx.request.method === "POST" || ctx.request.method === "GET")
    ) {
        const body = req.body && (await bodyToBuffer(req.body));
        req.body = body;

        if (body?.length) {
            console.log("request");
            console.log({ body });
            const packet = Packet.parse(Buffer.Buffer.from(body as Uint8Array));
            console.log({ packet });
        }
        const res = await next();
        const resbody = res.body && (await bodyToBuffer(res.body));
        res.body = resbody;

        if (resbody?.length) {
            console.log("response");
            console.log({ resbody });
            const packet = Packet.parse(
                Buffer.Buffer.from(resbody as Uint8Array)
            );
            console.log({ packet });
        }
        return;
    } else {
        return await next();
    }
}
