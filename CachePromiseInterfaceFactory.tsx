import {
    CachePromiseInterface,
    ResponseCacheType,
} from "./CachePromiseInterface.ts";

export async function CachePromiseInterfaceFactory(): Promise<CachePromiseInterface> {
    const cache = await Deno.openKv();

    return {
        async get(key) {
            // console.log(await Array.fromAsync(cache.list({ prefix: [] })));
            const result = await cache.get<ResponseCacheType>([key]);
            if (
                result.versionstamp &&
                result.value.expires > Date.now() &&
                result.value.body &&
                result.value.headers &&
                result.value.status &&
                result.value.ttl
            ) {
                console.log(key, result.value);
                return result.value;
            } else {
                return undefined;
            }
        },
        async set(key, value) {
            const result = await cache.set([key], value);
            // console.log(await Array.fromAsync(cache.list({ prefix: [] })));

            if (!result.ok) {
                throw Error(
                    "Failed to set " + key + " to " + JSON.stringify(value)
                );
            }
            console.log(key, value);
        },
    } satisfies CachePromiseInterface;
}
