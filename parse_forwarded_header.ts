/**
 * 解析Forwarded头部
 *
 * @param Forwarded - Forwarded头部字符串或null
 * @returns Map<string, string>[] - 返回Map对象数组
 */
export function parse_forwarded_header(
    Forwarded: string | null,
): Map<string, string>[] {
    if (!Forwarded) {
        return [];
    }
    return Forwarded.split(",").map((a) => {
        // 去除两边的空格
        return new Map<string, string>(
            a.split(";").map(
                (a) => a.split("=").map((a) => a.trim()) as [string, string], // 将字符串数组转换为键值对数组
            ) as [string, string][], // 将字符串数组转换为Map对象
        );
    });
}
