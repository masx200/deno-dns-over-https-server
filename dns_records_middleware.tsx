import { bodyToJSON } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/body/bodyToJSON.ts";
import {
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";

export async function dns_records_middleware(
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    if (
        new URL(context.request.url).pathname === ("/dns_records") &&
        context.request.method == "post" &&
        context.request.headers.get("content-type")?.startsWith(
            "application/json",
        )
    ) {
        const body = await bodyToJSON(
            context.request.body,
            context.request.headers,
        );
        return {
            headers: {
                "content-type": "application/json",
            },
            status: 200,
            body: JSON.stringify(
                body,
            ),
        };
    }
    await next();
    return;
}
