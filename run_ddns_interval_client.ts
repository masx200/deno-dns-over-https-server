// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

import parse from "npm:@masx200/mini-cli-args-parser@1.1.0";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import { getAllTailscaleNetworkIPsAndSelfPublicIPs } from "./get_all_tailscale_ips.ts";
import { DNSRecordsRemoteJSONRPC } from "./DNSRecordsRemote.ts";

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
        token: opts.token ?? "token",
        name: opts.name ?? "name",
        service_url: opts.service_url ?? "XXXXXXXXXXXXXXXXXXXXX",
    });
    setTimeout(() => stop(), 10000);
}

/**
 * 异步函数，用于执行一次DDNS更新
 * @param opts - 配置选项
 * @param opts.interval - 更新间隔时间（单位：秒）
 * @param opts.ipv4 - 是否使用IPv4地址
 * @param opts.ipv6 - 是否使用IPv6地址
 * @param opts.tailscale - 是否使用Tailscale网络地址
 * @param opts.public - 是否使用公共IP地址
 * @param opts.token - 访问令牌
 * @param opts.name - DNS记录名称
 * @param opts.service_url - 服务URL
 */
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
    // 获取所有Tailscale网络IP地址和自定义公共IP地址
    const dnscontents: DDNScontentContent[] =
        await getAllTailscaleNetworkIPsAndSelfPublicIPs({
            name: opts.name,
            public: opts.public,
            tailscale: opts.tailscale,
            ipv4: opts.ipv4,
            ipv6: opts.ipv6,
        });
    console.log(dnscontents);
    // 创建DNS记录远程JSON RPC客户端
    const client = new DNSRecordsRemoteJSONRPC(opts.service_url, opts.token);
    // 获取所有DNS记录
    console.log(await client.ListDNSRecords({ name: opts.name }));
}
