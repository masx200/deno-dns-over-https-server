// 导入 createHandler 函数
import { createHandler } from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
// 导入 middlewares
import { middlewares } from "./middlewares.tsx";

// 创建一个处理器
export const handler = createHandler(middlewares);
