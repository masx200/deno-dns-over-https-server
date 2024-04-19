import { parse, stringify } from "@masx200/cache-control-parser";
import {
    Context, // 日志记录中间件
    Middleware,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { get_path_name } from "./get_path_name.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";

/**
 * 设置缓存控制的最大年龄大于指定的最小年龄，并根据条件执行中间件函数。
 * @param min_age 最小年龄
 * @param condition 条件函数，参数为上下文对象，返回布尔值
 * @returns 中间件函数
 */
export function set_cache_control_max_age_greater_than(
    min_age: number,
    condition: (params: Context) => boolean,
): Middleware {
    return async function (context: Context, next): Promise<RetHandler> {
        if (get_path_name(context.request.url) != dns_query_path_name()) {
            return next();
        }

        await next();
        if (!condition(context)) return;
        const cacheControlHeader = context.response.headers.get(
            "cache-control",
        );
        // 设置cache-control不得小于min_age
        if (cacheControlHeader) {
            const cacheControl = parse(cacheControlHeader);
            if (cacheControl["max-age"]) {
                if (cacheControl["max-age"] < min_age) {
                    context.response.headers.set(
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
            context.response.headers.set(
                "cache-control",
                stringify({
                    "max-age": min_age,
                    "s-maxage": min_age,
                    "public": true,
                    private: false,
                }),
            );
        }
    };
}
