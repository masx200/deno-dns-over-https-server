import { base64Encode } from "./base64Encode.tsx";

/**
 * 获取DNS查询缓存键值
 * @param url 请求的URL
 * @param method 请求的方法
 * @param body 请求的body
 * @returns DNS查询缓存键值，如果请求方法是POST且body不为空，则返回base64编码后的body；如果请求方法是GET，则返回URL中的dns参数值
 */
export function get_dns_query_cache_key({
    url,
    method,
    body,
}: {
    url: string;
    method: string;
    body: Uint8Array | null | undefined;
}): string | null | undefined {
    if (method === "POST" && body) return base64Encode(body);

    if (method === "GET") return new URL(url).searchParams.get("dns");
}
