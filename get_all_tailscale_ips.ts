import { isIPv6 } from "https://deno.land/std@0.143.0/node/internal/net.ts";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import { runCommand } from "./runCommand.ts";
import {
    getPublicIpv4,
    getPublicIpv6,
} from "https://deno.land/x/masx200_get_public_ip_address@1.0.4/mod.ts";
export async function getAllTailscaleNetworkIPsAndSelfPublicIPs(
    opts: { name: string; public: boolean; tailscale: boolean },
): Promise<
    DDNScontentContent[]
> {
    const { name, tailscale } = opts;
    const selfIPs: string[] = [];
    const config = {
        [name]: selfIPs,
    };

    if (tailscale) {
        const text = await runCommand("tailscale", ["status", "--json"]);
        const data: {
            Self: { DNSName: string; TailscaleIPs: string[] };
            // Peer: Record<string, { DNSName: string; TailscaleIPs: string[] }>;
        } = JSON.parse(text);
        selfIPs.push(...Array.from(data.Self.TailscaleIPs));
        const tailscale_name = tailscale
            ? data.Self.DNSName.slice(0, -1)
            : name;
        config[tailscale_name] = selfIPs;
    }

    // for (const v of Object.values(data.Peer)) {
    //     Object.assign(config, {
    //         [v.DNSName.slice(0, -1)]: v.TailscaleIPs,
    //     });
    // }
    if (opts.public) {
        try {
            selfIPs.push(await getPublicIpv4());
        } catch (error) {
            console.error(error);
        }
        try {
            selfIPs.push(await getPublicIpv6());
        } catch (error) {
            console.error(error);
        }
    }
    // console.log(JSONSTRINGIFYNULL4(config, null, 4))
    // return config;
    const result = new Array<DDNScontentContent>();
    for (const [k, v] of Object.entries(config)) {
        for (const ip of v) {
            result.push({
                name: k,
                content: ip,
                type: isIPv6(ip) ? "AAAA" : "A",
            });
        }
    }
    return result;
}

// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
