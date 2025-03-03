import {
    Context,
    getOriginalOptions,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { RequestOptions } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/src/Context.ts";
import { ConnInfo } from "https://deno.land/std@0.182.0/http/server.ts";
import { STATUS_TEXT } from "https://deno.land/std@0.189.0/http/http_status.ts";
import { ArrayShuffle } from "./ArrayShuffle.ts";
import { resolveDNStcp } from "./dns_resolver-tcp.ts";
import { resolveDNSudp } from "./dns_resolver.ts";
import { DNSInterceptorOptions } from "./DNSInterceptorOptions.ts";
import { DNSPACKETInterface } from "./DNSPACKETInterface.ts";
import { proxyDnsOverHttps } from "./proxyDnsOverHttps.tsx";
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
                const opturl = typeof opt.url == "string" ? [opt.url] : opt.url;
                const errors = Array<string>();
                for (const urlstr of ArrayShuffle(opturl)) {
                    const url = new URL(urlstr);
                    if (url.protocol === "http:" || url.protocol === "https:") {
                        const doh = url.href;
                        const connInfo: ConnInfo = getOriginalOptions(context);
                        const response = await proxyDnsOverHttps(
                            doh,
                            /* url */ req,
                            connInfo,
                        );
                        if (
                            response.ok &&
                            response.headers.get("content-type") ===
                                "application/dns-message"
                        ) {
                            return response;
                        } else {
                            console.error(
                                `doh=${doh} ,status=${response.status} ,statusText=${response.statusText}`,
                            );
                            errors.push(
                                `doh=${doh} ,status=${response.status} ,statusText=${response.statusText}`,
                            );
                            continue;
                        }
                    } else if (url.protocol == "udp:") {
                        try {
                            const result = await resolveDNSudp(
                                data,
                                url.hostname,
                                Number(url.port.length ? url.port : "53"),
                            );
                            return { success: true, result: result };
                        } catch (error) {
                            console.error(error);
                            const doh = url.href;
                            const status = 502;
                            const statusText = STATUS_TEXT[status];
                            console.error(
                                `${doh} ${status} ${statusText}\n${
                                    String(
                                        error,
                                    )
                                }`,
                            );
                            errors.push(
                                `${doh} ${status} ${statusText}\n${
                                    String(
                                        error,
                                    )
                                }`,
                            );
                            continue;
                        }
                    } else if (url.protocol == "tcp:") {
                        try {
                            const result = await resolveDNStcp(
                                data,
                                url.hostname,
                                Number(url.port.length ? url.port : "53"),
                            );
                            return { success: true, result: result };
                        } catch (error) {
                            console.error(error);
                            //报错再重试一次
                            console.log("失败一次重试一次");
                            try {
                                const result = await resolveDNStcp(
                                    data,
                                    url.hostname,
                                    Number(url.port.length ? url.port : "53"),
                                );
                                return { success: true, result: result };
                            } catch (error) {
                                console.error(error);
                                const status = 502;
                                const doh = url.href;
                                const statusText = STATUS_TEXT[status];
                                console.error(
                                    `${doh} ${status} ${statusText}\n${
                                        String(
                                            error,
                                        )
                                    }`,
                                );
                                errors.push(
                                    `${doh} ${status} ${statusText}\n${
                                        String(
                                            error,
                                        )
                                    }`,
                                );
                                continue;
                            }
                        }
                    } else {
                        return { success: false, result: null };
                    }
                }
                return new Response(
                    "all doh server response failed\n" + errors.join("\n"),
                    {
                        status: 502,
                    },
                );
            }
        }
        return { success: false, result: null };
    } else {
        return { success: false, result: null };
    }
}
