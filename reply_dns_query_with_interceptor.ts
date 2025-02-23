import { resolveDNS } from "./dns_resolver.ts";
import { DNSPACKETInterface } from "./DNSPACKETInterface.ts";
import {
    Context,
    getOriginalOptions,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";
import { proxyDnsOverHttps } from "./proxyDnsOverHttps.tsx";
import { RequestOptions } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/src/Context.ts";
export async function reply_dns_query_with_interceptor(
    packet: DNSPACKETInterface,
    data: Uint8Array,
    context: Context,
    req: RequestOptions,
): Promise<
    { success: boolean; result: Uint8Array | null | undefined } | Response
> {
    const dns_interceptor = Deno.env.get("DNS_INTERCEPTOR");

    if (dns_interceptor) {
        const interceptoroptions: DNSInterceptorOptions = JSON.parse(
            dns_interceptor,
        ) as DNSInterceptorOptions;
        const name = packet.question[0]?.name;
        for (const opt of interceptoroptions) {
            if (name.endsWith("." + opt.suffix)) {
                const url = new URL(opt.url);
                if (url.protocol === "http:" || url.protocol === "https:") {
                    const doh = url.href;
                    const connInfo: ConnInfo = getOriginalOptions(context);
                    return await proxyDnsOverHttps(
                        doh,
                        /* url */ req,
                        connInfo,
                    );
                } else if (url.protocol == "udp:") {
                    const result = await resolveDNS(
                        data,
                        url.hostname,
                        Number(url.port.length ? url.port : "53"),
                    );
                    return { success: true, result: result };
                } else {
                    return { success: false, result: null };
                }
            }
        }
        return { success: false, result: null };
    } else {
        return { success: false, result: null };
    }
}
export interface DNSInterceptorOptions extends
    Array<{
        suffix: string;
        url: string;
    }> {}
