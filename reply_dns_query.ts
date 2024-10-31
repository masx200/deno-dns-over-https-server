/* 以下是对这段代码的总结解释：
一、导入模块
从相对路径导入config.ts文件，虽然后面代码中未明确使用，但可能在其他部分被引用。
从https://deno.land/std@0.169.0/node/internal/net.ts导入isIPv4和isIPv6函数，用于判断 IP 地址类型。
从本地文件分别导入DNSConfig、DNSPACKETInterface、dNSRecordsInstance、DNSRecordType、DNSServer和get_ttl_min相关模块，这些模块可能包含与 DNS 处理相关的类型定义、实例和函数。
从npm:lodash-es@4.17.21导入uniq函数，用于去除数组中的重复元素。
从本地文件导入getHostEntry函数，用于获取主机条目。
二、函数定义
定义了一个名为reply_dns_query的异步函数，接受一个DNSPACKETInterface类型的参数packet和一个Uint8Array类型的参数data，并返回一个包含success布尔值和result（可能是Uint8Array类型或null或undefined）的对象。
三、函数内部逻辑
首先检查传入的packet中的问题类型是否为A（IPv4 记录类型）或AAAA（IPv6 记录类型），如果不是则直接返回{ success: false, result: null }。
获取packet中第一个问题的名称，并尝试从本地获取该名称对应的主机条目。如果主机条目存在，则使用这些条目；否则，并行地调用dNSRecordsInstance.ListDNSRecords分别获取类型为A和AAAA的 DNS 记录，并将结果展平后映射为地址数组。
对地址数组进行过滤和去重，分别得到 IPv4 和 IPv6 地址数组。
再次检查如果请求的是A记录但没有 IPv4 地址，或者请求的是AAAA记录但没有 IPv6 地址，则返回失败结果。
如果有对应的地址，则创建一个DNSConfig对象，包含名称、最小生存时间（ttl）和对应的 IP 地址记录，并使用DNSServer处理请求并返回结果。
如果在整个过程中出现任何错误，捕获错误并打印，然后返回失败结果。 */
// import config from "./config.ts";
import {
    isIPv4,
    isIPv6,
} from "https://deno.land/std@0.169.0/node/internal/net.ts";
import { DNSConfig } from "./DNSConfig.ts";
import { DNSPACKETInterface } from "./DNSPACKETInterface.ts";
import { dNSRecordsInstance } from "./dNSRecordsInstance.ts";
import { DNSRecordType } from "./DNSRecordType.ts";
import { DNSServer } from "./DNSServer.ts";
import { get_ttl_min } from "./get_ttl_min.ts";
//@deno-types="https://unpkg.com/@types/lodash-es@4.17.12/index.d.ts"
import { uniq } from "npm:lodash-es@4.17.21";
import { getHostEntry } from "./getHostEntry.ts";
// import { DNSPACKET } from "./DNSPACKET.ts";
/**
 * 回复DNS查询
 * @param packet DNSPACKET对象
 * @param data Uint8Array对象
 * @returns { success: boolean; result: Uint8Array | null | undefined }对象
 */
export async function reply_dns_query(
    packet: DNSPACKETInterface,
    data: Uint8Array,
): Promise<{ success: boolean; result: Uint8Array | null | undefined }> {
    try {
        /**
         * 检查传入的DNS数据包是否包含A或AAAA记录类型。
         * 该函数不接受任何参数，直接根据传入的packet对象进行分析。
         *
         * @param packet - 一个包含DNS查询信息的对象。
         *                期望该对象有一个question数组，数组的第一个元素是一个包含type属性的对象。
         * @returns 返回一个对象，包含成功标识和结果。
         *          如果packet的question数组的第一个元素的type不是A或AAAA，则返回{ success: false, result: null }。
         */
        if (
            !([DNSRecordType.A, DNSRecordType.AAAA].includes(
                packet.question[0]?.type,
            ))
        ) return { success: false, result: null };
        const name = packet.question[0]?.name;

        const localdomainhosts = await getHostEntry(name);
        const address: string[] | undefined = localdomainhosts.length
            ? localdomainhosts
            : (await Promise.all([
                dNSRecordsInstance.ListDNSRecords({
                    name: name,
                    type: "A",
                }),
                dNSRecordsInstance.ListDNSRecords({
                    name: name,
                    type: "AAAA",
                }),
            ])).flat().map((a) => a.content);
        if (
            address?.length && name &&
            ([DNSRecordType.A, DNSRecordType.AAAA].includes(
                packet.question[0]?.type,
            ))
        ) {
            /* 可能有重复的地址 */
            const ipv4 = uniq(address.filter((a) => isIPv4(a)));
            const ipv6 = uniq(address.filter((a) => isIPv6(a)));
            /**
             * 根据传入的DNS数据包检查是否包含所需的IPv4或IPv6地址记录。
             * 如果数据包中第一个问题请求的是A记录（IPv4）且没有对应的IPv4地址时，返回失败结果。
             * 如果数据包中第一个问题请求的是AAAA记录（IPv6）且没有对应的IPv6地址时，返回失败结果。
             *
             * @param packet DNS数据包，包含问题和应答部分。
             * @returns 返回一个对象，包含操作成功与否的标志和结果。
             *          如果请求的记录类型与提供的地址类型匹配，则返回成功结果和相应的地址列表；
             *          如果没有找到匹配的地址记录，则返回失败结果和null。
             */
            if (
                ipv4.length === 0 &&
                packet.question[0]?.type === DNSRecordType.A
            ) {
                // 当请求A记录（IPv4）但没有提供IPv4地址时，返回失败结果
                return { success: false, result: null };
            }
            if (
                ipv6.length === 0 &&
                packet.question[0]?.type === DNSRecordType.AAAA
            ) {
                // 当请求AAAA记录（IPv6）但没有提供IPv6地址时，返回失败结果
                return { success: false, result: null };
            }
            const records: DNSConfig = {
                [name]: {
                    ttl: get_ttl_min(),
                    class: {
                        "IN": {
                            "A": ipv4.length ? ipv4 : null,
                            // TODO: Currently only A is returned as logic in dns_server shortcircuits the AAAA record.
                            "AAAA": ipv6.length ? ipv6 : null,
                            // "TXT": "This is some text.",
                        },
                    },
                },
            } as DNSConfig;
            // console.log(records);
            return {
                success: true,
                result: new DNSServer(records).HandleRequest(data),
            };
        } else {
            return { success: false, result: null };
        }
    } catch (e) {
        console.error(e);
        return { success: false, result: null };
    }
}
