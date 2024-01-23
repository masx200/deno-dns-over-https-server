/**
 * 获取URL的路径名
 * @param url - 要处理的URL字符串
 * @returns 路径名字符串
 */
export function get_path_name(url: string): string {
    const pathname = new URL(url).pathname;
    return pathname;
}
