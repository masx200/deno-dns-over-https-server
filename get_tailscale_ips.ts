import { runCommand } from "./runCommand.ts";

export async function getTailscaleNetworkIPs(): Promise<
    { [x: string]: string[] }
> {
    const text = await runCommand("tailscale", ["status", "--json"]);
    const data: {
        Self: { DNSName: string; TailscaleIPs: string[] };
        Peer: Record<string, { DNSName: string; TailscaleIPs: string[] }>;
    } = JSON.parse(text);

    const config = {
        [data.Self.DNSName.slice(0, -1)]: data.Self.TailscaleIPs,
    };

    for (const v of Object.values(data.Peer)) {
        Object.assign(config, {
            [v.DNSName.slice(0, -1)]: v.TailscaleIPs,
        });
    }
    // console.log(JSON.stringify(config, null, 4))
    return config;
}
// console.log(await getTailscaleNetworkIPs());
