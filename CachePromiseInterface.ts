// 缓存Promise接口
export type CachePromiseInterface = {
    /**
     * 设置缓存项
     * @param key 缓存项的键名
     * @param value 缓存项的键值对象，包含value和expires属性
     * @returns 返回一个Promise，表示设置成功
     */
    set(
        key: string,
        value: {
            status: number;
            headers: Record<string, string>;
            body: Uint8Array;
            expires: number;
        }
    ): Promise<void>;

    /**
     * 获取缓存项
     * @param key 缓存项的键名
     * @returns 返回一个Promise，包含value和expires属性的缓存项
     */
    get(key: string): Promise<
        | {
              status: number;
              headers: Record<string, string>;
              body: Uint8Array;
              expires: number;
          }
        | null
        | undefined
    >;
};
