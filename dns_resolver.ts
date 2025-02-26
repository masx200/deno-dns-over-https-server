import { assert, assertEquals, assertGreater } from "@std/assert";
/**
 * 发送 DNS 查询并接收响应
 * @param dnsPacket - DNS 数据包的二进制格式 (Uint8Array)
 * @param serverAddress - DNS 服务器的地址 (例如 "8.8.8.8")
 * @param serverPort - DNS 服务器的端口 (例如 53)
 * @returns Promise<Uint8Array> - 返回 DNS 响应数据包的二进制格式
 */
export async function resolveDNSudp(
    dnsPacket: Uint8Array,
    serverAddress: string,
    serverPort: number
): Promise<Uint8Array> {
    // 创建一个 UDP 套接字监听随机端口
    const listener = Deno.listenDatagram({
        port: 0, // 随机分配端口
        transport: "udp",
        hostname: "0.0.0.0",
    });
    console.log("Server - listening on", listener.addr);
    let isclosed = false;
    try {
        // 构造目标服务器地址
        const peerAddress: Deno.NetAddr = {
            transport: "udp",
            hostname: serverAddress,
            port: serverPort,
        };
        let senderror = null;
        let readerror = null;
        let response: Uint8Array = new Uint8Array();

        const read = async function () {
            for await (const [data, address] of listener) {
                console.log("Server - information from", address);
                console.log("Server - received:", data);

                if (
                    address.transport == "udp" &&
                    address.hostname === peerAddress.hostname &&
                    address.port === peerAddress.port
                ) {
                    response = data;
                    return;
                }
            }
        };

        const send = async function send() {
            for (let i = 0; i < 10; i++) {
                if (isclosed) {
                    return;
                }
                // console.log("send count", i);

                const bytessend = await listener.send(dnsPacket, peerAddress);
                // console.log("bytessend", bytessend);
                assertEquals(bytessend, dnsPacket.length);
                await new Promise((resolve) => setTimeout(resolve, 1));
            }
        };
        await timeoutPromise(
            Promise.all([
                read().then(
                    () => {
                        // console.log(r);
                        if (!isclosed) {
                            isclosed = true;

                            listener.close();
                        }
                    },
                    (e) => {
                        console.error(e);
                        readerror = e;
                        if (!isclosed) {
                            isclosed = true;

                            listener.close();
                        }
                    }
                ),
                // 发送 DNS 查询数据包到目标服务器
                send().then(
                    () => {},
                    (e) => {
                        console.error(e);
                        senderror = e;
                        if (!isclosed) {
                            isclosed = true;

                            listener.close();
                        }
                    }
                ),
            ]),
            3000
        );
        assertGreater(response.length, 0);
        assert(
            !Array.from(response).every((a) => a == 0),
            "response is all zero data"
        );
        // 接收来自服务器的响应
        if (response.length > 0) {
            return response; // 返回解析后的 DNS 响应数据包
        } else {
            throw new Error("response is null", {
                cause: { senderror, readerror },
            });
        }
    } finally {
        // 关闭监听器
        if (!isclosed) {
            isclosed = true;

            listener.close();
        }
    }
}

// 示例用法
export async function main() {
    // 构造一个简单的 DNS 查询数据包 (A 记录查询 example.com)
    const dnsQuery = new Uint8Array([
        0x0, 0x3, 0x1, 0x0, 0x0, 0x1, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8, 0x7a,
        0x68, 0x75, 0x61, 0x6e, 0x6c, 0x61, 0x6e, 0x5, 0x7a, 0x68, 0x69, 0x68,
        0x75, 0x3, 0x63, 0x6f, 0x6d, 0x0, 0x0, 0x1c, 0x0, 0x1,
    ]);

    const serverAddress = "223.6.6.6";
    // Google Public DNS
    const serverPort = 53;

    try {
        const starttime = Date.now();
        const response = await resolveDNSudp(
            dnsQuery,
            serverAddress,
            serverPort
        );
        console.log("cost time", Date.now() - starttime);
        console.log("DNS Response:", response);
    } catch (error) {
        console.error("Error resolving DNS:", error);
        throw error;
    }
}
if (import.meta.main) {
    await main();
}
export function timeoutPromise<T>(
    promise: Promise<T>,
    ms: number = 3000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Promise timed out after ${ms}ms`));
        }, ms);

        promise
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}
