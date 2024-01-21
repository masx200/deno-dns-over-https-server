import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";

export function replyInformation(
    req: Request,
    connInfo: ConnInfo,
    status: number
): Response {
    const { url, headers, method } = req;
    const data = {
        ...connInfo,
        url,
        method,
        headers: Object.fromEntries(headers),
    };

    const body = JSON.stringify(data);
    //     console.log("request", body);
    return new Response(body, {
        status,
        headers: {
            "Strict-Transport-Security": "max-age=31536000",
            "content-type": "application/json",
        },
    });
}
