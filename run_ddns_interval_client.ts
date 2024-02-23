// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

import parse from "npm:@masx200/mini-cli-args-parser@1.1.0";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import { getAllTailscaleNetworkIPsAndSelfPublicIPs } from "./get_all_tailscale_ips.ts";

export async function run_ddns_interval_client(
    opts: {
        interval: number;
        ipv4: boolean;
        ipv6: boolean;
        tailscale: boolean;
        public: boolean;
        token: string;
        name: string;
        service_url: string;
    },
): Promise<() => void> {
    await run_ddns_update_once(opts);
    const timer = setInterval(async () => {
        await run_ddns_update_once(opts);
    }, opts.interval);
    return () => clearInterval(timer);
}

if (import.meta.main) {
    const opts = parse(Deno.args);
    console.log(opts);
    const stop = await run_ddns_interval_client({
        interval: Number(opts.interval || 30 * 1000),
        ipv4: Boolean(opts.ipv4 ?? true),
        ipv6: Boolean(opts.ipv6 ?? true),
        tailscale: Boolean(opts.tailscale ?? true),
        public: Boolean(opts.public ?? true),
        token: opts.public ?? "token",
        name: opts.name ?? "name",
        service_url: opts.service_url ?? "XXXXXXXXXXXXXXXXXXXXX",
    });
    setTimeout(() => stop(), 10000);
}

async function run_ddns_update_once(
    opts: {
        interval: number;
        ipv4: boolean;
        ipv6: boolean;
        tailscale: boolean;
        public: boolean;
        token: string;
        name: string;
        service_url: string;
    },
) {
    const dnscontents: DDNScontentContent[] =
        await getAllTailscaleNetworkIPsAndSelfPublicIPs({
            name: opts.name,
            public: opts.public,
            tailscale: opts.tailscale,
            ipv4: opts.ipv4,
            ipv6: opts.ipv6,
        });
    console.log(dnscontents);
}
