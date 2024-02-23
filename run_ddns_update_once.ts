import { isIPv6 } from "https://deno.land/std@0.143.0/node/internal/net.ts";

import { getAllTailscaleNetworkIPsAndSelfPublicIPs } from "./get_all_tailscale_ips.ts";
import { DNSRecordsRemoteJSONRPC } from "./DNSRecordsRemote.ts";

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
export async function run_ddns_update_once(
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
    const client = new DNSRecordsRemoteJSONRPC(opts.service_url, opts.token);
    const [localdata, remotedata] = await Promise.all([
        getAllTailscaleNetworkIPsAndSelfPublicIPs({
            name: opts.name,
            public: opts.public,
            tailscale: opts.tailscale,
            ipv4: opts.ipv4,
            ipv6: opts.ipv6,
        }),
        client.ListDNSRecords({ name: opts.name }),
    ]);

    console.log("本地地址信息", localdata);

    console.log("远程地址信息", remotedata);

    const localset = new Set(localdata.map((a) => a.content));
    const remoteset = new Set(remotedata.map((a) => a.content));
    if (
        localset.size === remoteset.size &&
        [...localset].every((value) => remoteset.has(value))
    ) {
        console.log("两个地址记录完全相等");
        return;
    } else {
        console.log("两个地址记录不相等");
        const differencelocalsetToremoteset = new Set(
            [...localset].filter((x) => !remoteset.has(x)),
        );
        console.log("需要添加的地址", differencelocalsetToremoteset);
        const differenceremotesetTolocalset = new Set(
            [...remoteset].filter((x) => !localset.has(x)),
        );
        console.log("需要删除的地址", differenceremotesetTolocalset);
        const recordstobedeletedids = [...differenceremotesetTolocalset].map(
            (b) => remotedata.filter((a) => a.content === b),
        ).flat();

        const 需要删除的记录ID = recordstobedeletedids.map((a) => ({
            id: a.id,
        }));
        const 需要添加的记录内容 = [...differencelocalsetToremoteset].map((
            a,
        ) => ({
            content: a,
            name: opts.name,
            type: isIPv6(a) ? "AAAA" : "A",
        }));
        console.log(
            await Promise.all([
                client.CreateDNSRecord(
                    需要添加的记录内容,
                ),
                client.DeleteDNSRecord(
                    需要删除的记录ID,
                ),
            ]),
        );
        console.log("更新完成", { 需要删除的记录ID, 需要添加的记录内容 });
    }
}
