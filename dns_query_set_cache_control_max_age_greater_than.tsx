import { get_path_name } from "./get_path_name.tsx";
// 导入get_path_name函数，用于获取路径名

import { set_cache_control_max_age_greater_than } from "./set_cache_control_max_age_greater_than.tsx";
// 导入set_cache_control_max_age_greater_than函数，用于设置缓存控制最大年龄

import { dns_query_path_name } from "./dns_query_path_name.tsx";
// 导入dns_query_path_name函数，用于查询路径名

import { get_ttl_min } from "./get_ttl_min.ts";
// 导入get_ttl_min函数，用于获取最小缓存寿命

export const dns_query_set_cache_control_max_age_greater_than =
    set_cache_control_max_age_greater_than(
        get_ttl_min(),
        (ctx) =>
            get_path_name(ctx.request.url) === dns_query_path_name() &&
            ctx.response.status === 200,
    );
// 定义dns_query_set_cache_control_max_age_greater_than函数，用于设置缓存控制最大年龄并且查询路径名
