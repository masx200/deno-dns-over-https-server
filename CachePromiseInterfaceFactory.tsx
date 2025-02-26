import {
    CachePromiseInterface,
    ResponseCacheType,
} from "./CachePromiseInterface.ts";
import { JSONSTRINGIFYNULL4 } from "./JSONSTRINGIFYNULL4.ts";

/**
 * CachePromiseInterfaceFactory函数用于创建一个CachePromiseInterface实例
 * @returns {Promise<CachePromiseInterface>} 返回一个实现了CachePromiseInterface接口的Promise实例
 */
export async function CachePromiseInterfaceFactory(): Promise<
    CachePromiseInterface
> {
    const cache = await Deno.openKv();

    return {
        async get(key): Promise<ResponseCacheType | undefined> {
            // 获取缓存中的数据
            // 获取缓存条目并判断是否有效
            const result = await cache.get<ResponseCacheType>([key]);
            if (
                result.versionstamp &&
                result.value.expires > Date.now() &&
                result.value.body &&
                result.value.headers &&
                result.value.status &&
                result.value.ttl
            ) {
                // console.log(
                //     JSONSTRINGIFYNULL4(
                //         { function: "get", key, value: result.value },
                //         null,
                //         4,
                //     ),
                // );
                return result.value;
            } else {
                return undefined;
            }
        },
        async set(key, value): Promise<Deno.KvCommitResult> {
            // 设置缓存数据
            const result = await cache.set([key], value, {
                expireIn: value.ttl,
            });
            // console.log(await Array.fromAsync(cache.list({ prefix: [] }))));

            if (!result.ok) {
                throw Error(
                    "Failed to set " + key + " to " + JSONSTRINGIFYNULL4(value),
                );
            }
            // console.log(
            //     JSONSTRINGIFYNULL4({ function: "set", key, value }, null, 4),
            // );
            return result;
        },
    } satisfies CachePromiseInterface;
}
