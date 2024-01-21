import {
    Context,
    getOriginalOptions,
    NextFunction,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { handlerMain } from "./handlerMain.tsx";

export const mainMiddleware = async (
    ctx: Context,
    next: NextFunction
): Promise<Response> => {
    // console.log(1);
    // await next();
    // console.log(3);
    const req = ctx.request;
    const con = getOriginalOptions(ctx);
    return handlerMain(new Request(req.url, req), con);
};
