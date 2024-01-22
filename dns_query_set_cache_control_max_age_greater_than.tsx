import { get_path_name } from "./get_path_name.tsx";
import { set_cache_control_max_age_greater_than } from "./set_cache_control_max_age_greater_than.tsx";
import { dns_query_path_name } from "./dns_query_path_name.tsx";

export const dns_query_set_cache_control_max_age_greater_than =
    set_cache_control_max_age_greater_than(
        300,
        (ctx) =>
            get_path_name(ctx.request.url) === dns_query_path_name() &&
            ctx.response.status === 200,
    );
