import {
    // bodyToBuffer,
    logger,
    Middleware,
} from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { error_handler } from "./error_handler.tsx";
import { Strict_Transport_Security } from "./Strict_Transport_Security.tsx";
import { mainMiddleware } from "./mainMiddleware.tsx";

export const middlewares: Middleware | Middleware[] | undefined = [
    error_handler,
    logger,
    Strict_Transport_Security,
    mainMiddleware,
];
