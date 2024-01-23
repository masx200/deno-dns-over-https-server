/**
 * 响应缓存类型接口
 */
export interface ResponseCacheType {
    /**
     * 状态码
     */
    status: number;
    /**
     * 头部信息
     */
    headers: Record<string, string>;
    /**
     * 响应体
     */
    body: Uint8Array;
    /**
     * 过期时间
     */
    expires: number;
    /**
     * 有效期时间
     */
    ttl: number;
}
// 缓存Promise接口
export type CachePromiseInterface = {
    /**
     * 设置缓存项
     * @param key 缓存项的键名
     * @param value 缓存项的键值对象，包含value和expires属性
     * @returns 返回一个Promise，表示设置成功
     */
    set(key: string, value: ResponseCacheType): Promise<void>;

    /**
     * 获取缓存项
     * @param key 缓存项的键名
     * @returns 返回一个Promise，包含value和expires属性的缓存项
     */
    get(key: string): Promise<ResponseCacheType | null | undefined>;
};
