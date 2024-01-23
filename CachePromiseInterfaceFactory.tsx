import { CachePromiseInterface } from "./CachePromiseInterface.ts";

export async function CachePromiseInterfaceFactory(): Promise<CachePromiseInterface> {
    const cache = await Deno.openKv();

    return {
        async get(key) {
            const result = await cache.get<{
                status: number;
                headers: Record<string, string>;
                body: Uint8Array;
                expires: number;
            }>([key]);
            if (
                result.versionstamp &&
                result.value.expires > Date.now() &&
                result.value.body &&
                result.value.headers &&
                result.value.status
            ) {
                return result.value;
            } else {
                return undefined;
            }
        },
        async set(key, value) {
            const result = await cache.set([key], value);
            if (!result.ok) {
                throw Error(
                    "Failed to set " + key + " to " + JSON.stringify(value)
                );
            }
        },
    } satisfies CachePromiseInterface;
}
