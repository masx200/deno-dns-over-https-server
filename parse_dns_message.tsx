import {
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";

export async function parse_dns_message(
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    return await next();
}
