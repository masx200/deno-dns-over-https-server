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
    // console.log("dns_records_middleware");
    if (
        new URL(context.request.url).pathname === ("/dns_records") &&
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
