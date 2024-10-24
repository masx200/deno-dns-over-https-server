// 导入所需模块
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";
import { handler } from "./handler.tsx";
import process from "node:process";

// 如果当前脚本是作为主脚本运行
if (import.meta.main) {
    /* error: Uncaught (in promise) TimedOut: timed out
      rr = await this.#rd.read(this.#buf);
           ^
    at async TlsConn.read (ext:deno_net/01_net.js:135:15)
    at async BufReader.read (https://deno.land/std@0.154.0/io/buffer.ts:383:12)
    at async BufReader.readFull (https://deno.land/std@0.154.0/io/buffer.ts:415:20)
    at async WireProtocol.receive (https://deno.land/x/mongo@v0.32.0/src/protocol/protocol.ts:110:28) */
    process.on("uncaughtException", (error, origin) => {
        console.error(error, origin);
        // 这里可以添加额外的处理逻辑，比如记录日志或者尝试重启服务
    });

    console.log({
        mongodb_url: Deno.env.get("mongodb_url"),
        mongodb_db: Deno.env.get("mongodb_db"),
        mongodb_collection: Deno.env.get("mongodb_collection"),
        DOH_PATHNAME: Deno.env.get("DOH_PATHNAME"),
        ttl: Deno.env.get("ttl"),
        doh: Deno.env.get("doh"),
        token: Deno.env.get("token"),
    });
    // 解析命令行参数，并获取端口号和主机名
    let { port, hostname } = parse(Deno.args);
    console.log({ port, hostname });
    // 如果端口号或主机名存在
    if (port || hostname) {
        // 如果端口号不存在，则设置默认端口号为8000
        port ??= 8000;
        // 如果主机名不存在，则设置默认主机名为0.0.0.0
        hostname ??= "0.0.0.0";

        // 启动服务器，监听指定的端口号和主机名
        await serve(handler, { port, hostname });
    } else {
        // 否则，使用默认的端口号8000和主机名0.0.0.0监听
        // await Promise.all([
        //     serve(handler, { hostname: "::", port: 8000 }),
        serve(handler, { hostname: "0.0.0.0", port: 8000 }); //,
        // ]);
    }
}
