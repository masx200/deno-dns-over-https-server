import { runCommand } from "./runCommand.ts";
import {
    getPublicIpv4,
    getPublicIpv6,
} from "https://deno.land/x/masx200_get_public_ip_address@1.0.4/mod.ts";
export async function getAllTailscaleNetworkIPsAndSelfPublicIPs(): Promise<
    { [x: string]: string[] }
> {
    const text = await runCommand("tailscale", ["status", "--json"]);
    const data: {
        Self: { DNSName: string; TailscaleIPs: string[] };
        Peer: Record<string, { DNSName: string; TailscaleIPs: string[] }>;
    } = JSON.parse(text);

    const selfIPs = Array.from(data.Self.TailscaleIPs);
    const config = {
        [data.Self.DNSName.slice(0, -1)]: selfIPs,
    };

    for (const v of Object.values(data.Peer)) {
        Object.assign(config, {
            [v.DNSName.slice(0, -1)]: v.TailscaleIPs,
        });
    }
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
    // console.log(JSONSTRINGIFYNULL4(config, null, 4))
    return config;
}

// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
