import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";
import { replyInformation } from "./replyInformation.tsx";
import { proxyDnsOverHttps } from "./proxyDnsOverHttps.tsx";
import { proxyCheckerDoh } from "./proxyCheckerDoh.tsx";

export async function handlerMain(
    req: Request,
    connInfo: ConnInfo,
): Promise<Response> {
    // return new Response(new Uint8Array([44, 11, 22, 99]));
    const doh = Deno.env.get("doh");
    const { url } = req;

    const pathname = new URL(url).pathname;
    if (doh && proxyCheckerDoh(pathname, doh)) {
        return await proxyDnsOverHttps(doh, url, req);
    } else {
        return replyInformation(req, connInfo);
    }
}
