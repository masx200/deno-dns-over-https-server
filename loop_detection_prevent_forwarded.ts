import {
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/src/Middleware.ts";
import { Context } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/src/Context.ts";
import { parse_forwarded_header } from "./parse_forwarded_header.ts";

/**
 * 防止环路的产生的中间件forwarded
 */
export async function loop_detection_prevent_forwarded(
    ctx: Context,
    next: NextFunction,
): Promise<RetHandler> {
    const req = ctx.request;
    const Forwarded = req.headers.get("Forwarded");

    const forwarded_map = parse_forwarded_header(Forwarded);
    const hosts_forwarded = forwarded_map
        .map((a) => a.get("host"))
        .filter(Boolean);
    const bys_forwarded = forwarded_map.map((a) => a.get("by")).filter(Boolean);
    const fors_forwarded = forwarded_map
        .map((a) => a.get("for"))
        .filter(Boolean);
    //预防循环转发的主机

    //检查是否存在循环转发
    if (
        new Set(hosts_forwarded).size != hosts_forwarded.length ||
        new Set(bys_forwarded).size != bys_forwarded.length ||
        new Set(fors_forwarded).size != fors_forwarded.length
    ) {
        const message = JSON.stringify({ forwarded: Forwarded }, null, 4);
        console.error("loop detected", message);
        return new Response("loop detected\n" + message, { status: 508 });
    } else {
        return await next();
    }
}
