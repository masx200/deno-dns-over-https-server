// 异步函数，发送一个用于调试的请求
import { parse, stringify } from "@masx200/cache-control-parser";
/**
 * 从缓存中获取数据，如果缓存不存在则请求数据并缓存起来
 * 此函数主要用于调试目的，通过调整缓存控制头来确保请求的响应符合预期的缓存策略
 *
 * @param cachename 缓存的名称，用于区分不同的缓存存储
 * @param fetchDebug 一个函数，用于发起网络请求，以便在缓存未命中时获取数据
 * @param min_age 最小缓存时间（秒），确保响应被缓存至少这么长时间
 * @param input 请求的URL或URL对象
 * @param init 可选的请求初始化对象，包含请求的额外信息（如方法、头等）
 * @returns 返回一个Promise，解析为Response对象，表示缓存的或新获取的响应
 */
export async function CacheStoragefetchDebug(
    cachename: string,
    fetchDebug: (
        input: RequestInfo | URL,
        init?: RequestInit | undefined,
    ) => Promise<Response>,
    min_age: number,
    input: RequestInfo | URL, // 请求的URL或URL对象
    init?: RequestInit | undefined,
): Promise<Response> {
    const cache = await caches.open(cachename);
    const request = new Request(input, init);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        console.log(`CacheStorage ${cachename} cache hit:` + request.url);
        return cachedResponse;
    }
    console.log(`CacheStorage ${cachename} cache miss:` + request.url);
    const response = await fetchDebug(input, init);
    if (request.method == "GET" && response.ok) {
        const cacheControlHeader = response.headers.get(
            "cache-control",
        );
        const hea2 = new Headers(response.headers);

        if (cacheControlHeader) {
            const cacheControl = parse(cacheControlHeader);
            if (cacheControl["max-age"]) {
                if (cacheControl["max-age"] < min_age) {
                    hea2.set(
                        "cache-control",
                        stringify({
                            "max-age": min_age,
                            "s-maxage": min_age,
                            "public": true,
                            private: false,
                        }),
                    );
                }
            }
        } else {
            hea2.set(
                "cache-control",
                stringify({
                    "max-age": min_age,
                    "s-maxage": min_age,
                    "public": true,
                    private: false,
                }),
            );
        }
        const res2 = new Response(response.body, {
            headers: hea2,
            status: response.status,
            statusText: response.statusText,
        });
        await cache.put(request, res2.clone());
        return res2;
    }
    return response;
}
