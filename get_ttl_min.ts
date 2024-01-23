/**
 * 获取最小缓存时间
 * @returns {number} 最小缓存时间
 */
export function get_ttl_min(): number {
    return Number(Deno.env.get("ttl") ?? 300);
}
