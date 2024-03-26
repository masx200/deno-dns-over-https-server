// import config from "./config.ts";
import { get_ttl_min } from "./get_ttl_min.ts";
import {
    isIPv4,
    isIPv6,
} from "https://deno.land/std@0.169.0/node/internal/net.ts";
import { DNSServer } from "./DNSServer.ts";
import { DNSConfig } from "./DNSConfig.ts";
import { DNSRecordType } from "./DNSRecordType.ts";
import { DNSPACKETInterface } from "./DNSPACKETInterface.ts";
import { dNSRecordsInstance } from "./dNSRecordsInstance.ts";
//@deno-types="https://unpkg.com/@types/lodash-es@4.17.12/index.d.ts"
import { uniq } from "npm:lodash-es@4.17.21";
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
    const address: string[] | undefined = (await Promise.all([
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
        if (ipv4.length === 0 && packet.question[0]?.type === DNSRecordType.A) {
            // 当请求A记录（IPv4）但没有提供IPv4地址时，返回失败结果
            return { success: false, result: null };
        }
        if (
            ipv6.length === 0 && packet.question[0]?.type === DNSRecordType.AAAA
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
}
