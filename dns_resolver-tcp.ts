import { assert, assertGreater } from "@std/assert";
import { readAll } from "jsr:@std/io";
import { writeAll } from "jsr:@std/io";
/**
 * 发送 DNS 查询并接收响应
 * @param dnsPacket - DNS 数据包的二进制格式 (Uint8Array)
 * @param serverAddress - DNS 服务器的地址 (例如 "8.8.8.8")
 * @param serverPort - DNS 服务器的端口 (例如 53)
 * @returns Promise<Uint8Array> - 返回 DNS 响应数据包的二进制格式
 */
export async function resolveDNStcp(
    dnsPacket: Uint8Array,
    serverAddress: string,
    serverPort: number
): Promise<Uint8Array> {
    let conn: Deno.Conn | undefined;

    try {
        // 建立 TCP 连接到 DNS 服务器
        conn = await timeoutPromise(
            Deno.connect({ hostname: serverAddress, port: serverPort }),
            3000
        );
        console.log(
            "Connected to DNS server:" + serverAddress + ":" + serverPort
        );
        // TCP 协议要求在数据包前加上 2 字节的长度字段
        const lengthPrefix = new Uint8Array(2);
        new DataView(lengthPrefix.buffer).setUint16(0, dnsPacket.length, false); // 写入查询包的长度（大端格式）

        // 发送 DNS 数据包
        await writeAll(conn, new Uint8Array([...lengthPrefix, ...dnsPacket])); //.write(new Uint8Array([...lengthPrefix, ...dnsPacket]));
        await conn.closeWrite();

        // 接收响应数据包
        // const buffer = new Uint8Array(1024 * 1024); // 创建一个缓冲区用于接收数据
        const buffer = await timeoutPromise(
            readAll(conn) /* conn.read(buffer) */,
            3000
        );

        if (buffer.length === 0) {
            throw new Error("No data received from the DNS server");
        }
        // 提取实际的 DNS 响应数据
        const responseLength = new DataView(buffer.buffer).getUint16(0, false); // 读取前两个字节作为长度字段
        const responseData = buffer.subarray(2, 2 + responseLength); // 提取实际的 DNS 响应数据
        const result = responseData;
        assertGreater(result.length, 0);
        assert(
            !Array.from(result).every((a) => a == 0),
            "response is all zero data"
        );
        console.log("Received DNS response:", result);
        // 返回接收到的数据
        return result;
    } catch (error) {
        throw new Error(`Failed to resolve DNS over TCP:`, { cause: error });
    } finally {
        // 确保连接被关闭
        if (conn) {
            conn.close();
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

    const serverAddress = "142.171.123.133";
    // Google Public DNS
    const serverPort = 53;

    try {
        const starttime = Date.now();
        const response = await resolveDNStcp(
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
