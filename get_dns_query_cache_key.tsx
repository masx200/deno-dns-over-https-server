import { base64Encode } from "./base64Encode.tsx";

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
