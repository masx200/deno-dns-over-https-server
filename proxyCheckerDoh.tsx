import { dns_query_path_name } from "./dns_query_path_name.tsx";

/**
 * 用于检查代理路径和DNS查询地址是否匹配
 * @param pathname 请求路径
 * @param doh DNS查询地址
 * @returns 返回是否匹配
 */
export function proxyCheckerDoh(
    pathname: string,
    doh: string | undefined,
): boolean {
    return Boolean(
        pathname === dns_query_path_name() &&
            (doh?.startsWith("https://") || doh?.startsWith("http://")),
    );
}
