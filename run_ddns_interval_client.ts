// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

import parse from "npm:@masx200/mini-cli-args-parser@1.1.0";
import { run_ddns_update_once } from "./run_ddns_update_once.ts";

/**
 * 异步函数，用于运行DDNS间隔客户端
 * @param opts - 包含以下属性的对象：
 *   - interval: 数值，表示更新间隔时间（单位：毫秒）
 *   - ipv4: 布尔值，表示是否启用IPv4
 *   - ipv6: 布尔值，表示是否启用IPv6
 *   - tailscale: 布尔值，表示是否启用Tailscale
 *   - public: 布尔值，表示是否启用公共DNS
 *   - token: 字符串，表示API令牌
 *   - name: 字符串，表示DDNS名称
 *   - service_url: 字符串，表示DDNS服务URL
 * @returns 返回一个函数，用于清除定时器
 */
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
    await run_ddns_update_once(opts); // 运行一次DDNS更新
    const timer = setInterval(async () => {
        await run_ddns_update_once(opts); // 每隔指定时间运行一次DDNS更新
    }, opts.interval);
    return () => clearInterval(timer); // 返回一个清除定时器的函数
}

if (import.meta.main) {
    const opts = parse(Deno.args);
    console.log(opts);
    /*  const stop = */ await run_ddns_interval_client({
        interval: Number(opts.interval || 30 * 1000),
        ipv4: Boolean(opts.ipv4 ?? true),
        ipv6: Boolean(opts.ipv6 ?? true),
        tailscale: Boolean(opts.tailscale ?? true),
        public: Boolean(opts.public ?? true),
        token: opts.token ?? "token",
        name: opts.name ?? "name",
        service_url: opts.service_url ?? "XXXXXXXXXXXXXXXXXXXXX",
    });
    // setTimeout(() => stop(), 10000);
}
