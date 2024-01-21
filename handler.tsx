// 导入 createHandler 函数
import { createHandler } from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
// 导入 middlewares
import { middlewares } from "./middlewares.tsx";

// 创建一个处理器
export const handler = createHandler(middlewares);
