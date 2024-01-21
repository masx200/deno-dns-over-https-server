import { createHandler } from "https://deno.land/x/masx200_deno_http_middleware@3.2.1/mod.ts";
import { middlewares } from "./middlewares.tsx";

export const handler = createHandler(middlewares);
