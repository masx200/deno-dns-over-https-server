/**
 * 获取DoH的URL地址
 * @returns {string} DoH的URL地址
 */
export function get_doh_url(): string {
    if (
        Deno.env.get("doh")?.startsWith("[") &&
        Deno.env.get("doh")?.endsWith("]")
    ) {
        const dohs = JSON.parse(Deno.env.get("doh") ?? "");

        if (dohs.length) {
            return new URL(dohs[Math.floor(dohs.length * Math.random())]).href;
        }
    }
    return new URL(Deno.env.get("doh") ?? "https://dns.alidns.com/dns-query")
        .href;
}
