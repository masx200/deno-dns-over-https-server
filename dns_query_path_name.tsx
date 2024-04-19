/**
 * 导出一个函数，用于获取DNS查询路径名称
 * @returns {string} DNS查询路径名称
 */
export function dns_query_path_name(): string {
    return Deno.env.get("DOH_PATHNAME") ?? "/dns-query";
}
