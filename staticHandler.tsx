import {
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import { serveDir } from "https://deno.land/std@0.220.1/http/file_server.ts";
export async function staticHandler(
    context: Context,
    next: NextFunction,
): Promise<RetHandler> {
    const req = new Request(context.request.url, context.request);
    const target = "./static/dist";
    return await serveDir(req, {
        fsRoot: target,
        // showDirListing: serverArgs["dir-listing"],
        // showDotfiles: serverArgs.dotfiles,
        //  enableCors: serverArgs.cors,
        //  quiet: !serverArgs.verbose,
        //   headers,
    });
}
