import {
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { dns_records_path_name } from "./dns_records_path_name.tsx";
export async function dns_records_authentication(
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    const token = Deno.env.get("token");

    if (
        new URL(context.request.url).pathname === dns_records_path_name()
    ) {
        if (
            ("Bearer " + token) !== context.request.headers.get("Authorization")
        ) {
            return {
                status: 401,
                body: "unauthorized",
                headers: {
                    "WWW-Authenticate": 'Bearer realm="example"',
                },
            };
        }
        return await next();
    }

    return await next();
}
