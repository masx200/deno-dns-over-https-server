/**
 * 获取DoH的URL地址
 * @returns {string} DoH的URL地址
 */
export function get_doh_url(): string {
    return new URL(Deno.env.get("doh") ?? "https://dns.alidns.com/dns-query")
        .href;
}
