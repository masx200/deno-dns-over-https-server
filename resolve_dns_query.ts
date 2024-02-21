import { base64Decode } from "./base64Decode.tsx";
import config from "./config.ts";
import { dns_query_path_name } from "./dns_query_path_name.tsx";
import { get_path_name } from "./get_path_name.tsx";
import { get_ttl_min } from "./get_ttl_min.ts";
/* https://github.com/matt1/deno-nameserver */
import {
    bodyToBuffer,
    Context,
    NextFunction,
    RetHandler,
} from "https://cdn.jsdelivr.net/gh/masx200/deno-http-middleware@3.3.0/mod.ts";
import Packet from "npm:native-dns-packet@0.1.1";
// console.log(JSONSTRINGIFYNULL4({ Packet });
import {
    isIPv4,
    isIPv6,
} from "https://deno.land/std@0.169.0/node/internal/net.ts";
import Buffer from "npm:buffer@6.0.3";
import { DNSServer } from "./DNSServer.ts";

// console.log(JSONSTRINGIFYNULL4({ Buffer });

export async function resolve_dns_query(
    ctx: Context,
    next: NextFunction,
): Promise<RetHandler> {
    const req = ctx.request;
    const { url } = req;
    const pathname = get_path_name(url);
    if (
        pathname === dns_query_path_name() &&
        (ctx.request.method === "POST" || ctx.request.method === "GET")
    ) {
        if (
            ctx.request.method === "GET" &&
            new URL(url).searchParams.get("dns")?.length
        ) {
            const data = base64Decode(
                new URL(url).searchParams.get("dns") ?? "",
            );
            const packet: DNSPACKET = Packet.parse(
                Buffer.Buffer.from(data as Uint8Array),
            );
            const { success, result } = reply_dns_query(packet, data);

            if (success && result?.length) {
                const ttl = get_ttl_min();
                ctx.response.body = result;
                ctx.response.status = 200;
                ctx.response.headers.set(
                    "content-type",
                    "application/dns-message",
                );
                ctx.response.headers.set("cache-control", "max-age=" + ttl);
                return;
            } else {
                return next();
            }
            // console.log(
            //     JSONSTRINGIFYNULL4({ request: { packet, data: data } }, null, 4),
            // );
        } else if (
            ctx.request.method === "POST" &&
            req.headers.get("content-type") === "application/dns-message"
        ) {
            const body = req.body && (await bodyToBuffer(req.body));
            req.body = body;

            if (body?.length) {
                const packet: DNSPACKET = Packet.parse(
                    Buffer.Buffer.from(body as Uint8Array),
                );
                const { success, result } = reply_dns_query(
                    packet,
                    body as Uint8Array,
                );

                if (success && result?.length) {
                    const ttl = get_ttl_min();
                    ctx.response.body = result;
                    ctx.response.status = 200;
                    ctx.response.headers.set(
                        "content-type",
                        "application/dns-message",
                    );
                    ctx.response.headers.set("cache-control", "max-age=" + ttl);
                    return;
                } else {
                    return next();
                }
                // console.log(
                //     JSONSTRINGIFYNULL4(
                //         { request: { packet, data: body } },
                //         null,
                //         4,
                //     ),
                // );
                // console.log();
                // console.log(JSONSTRINGIFYNULL4({ packet });
            }
        }
        // const res = await next();

        // if (
        //     res.status === 200 &&
        //     res.headers.get("content-type") === "application/dns-message"
        // ) {
        //     const resbody = res.body && (await bodyToBuffer(res.body));
        //     res.body = resbody;

        //     if (resbody?.length) {
        //         const packet = Packet.parse(
        //             Buffer.Buffer.from(resbody as Uint8Array),
        //         );
        //         // console.log(
        //         //     JSONSTRINGIFYNULL4(
        //         //         { response: { packet, data: resbody } },
        //         //         null,
        //         //         4,
        //         //     ),
        //         // );
        //         // console.log(JSONSTRINGIFYNULL4({ resbody });

        //         // console.log(JSONSTRINGIFYNULL4({ packet });
        //     }
        // }
        await next();
        return;
    } else {
        return await next();
    }
}
export interface DNSPACKETWITHQUESTION {
    question: {
        "name": string;
        "type": number;
        "class": number;
    }[];
}
export interface DNSPACKETWITHANSWER {
    answer: {
        "name": string;
        "type": number;
        "class": number;
        "ttl": number;
        "address": string;
        // "data"?: string;
    }[];
}

export type DNSPACKET =
    & DNSPACKETWITHANSWER
    & DNSPACKETWITHQUESTION
    & {
        header: {
            id: number;
            qr: number;
            opcode: number;
            aa: number;
            tc: number;
            rd: number;
            ra: number;
            res1: number;
            res2: number;
            res3: number;
            rcode: number;
        };
    };

export function reply_dns_query(
    packet: DNSPACKET,
    data: Uint8Array,
): { success: boolean; result: Uint8Array | null | undefined } {
    const name = packet.question[0]?.name;
    const address: string[] | undefined = config[name];

    if (
        address?.length && name &&
        ([DNSRecordType.A, DNSRecordType.AAAA].includes(
            packet.question[0]?.type,
        ))
    ) {
        const ipv4 = address.filter((a) => isIPv4(a))[0];
        const ipv6 = address.filter((a) => isIPv6(a))[0];
        const records: DNSConfig = {
            [name]: {
                ttl: get_ttl_min(),
                class: {
                    "IN": {
                        "A": ipv4,
                        // TODO: Currently only A is returned as logic in dns_server shortcircuits the AAAA record.
                        "AAAA": ipv6,
                        // "TXT": "This is some text.",
                    },
                },
            },
        } as DNSConfig;
        console.log(records);
        return {
            success: true,
            result: new DNSServer(records).HandleRequest(data),
        };
    } else {
        return { success: false, result: null };
    }
}
/** Print a number as a hex fomatted number. */
export function hex(num: number): string {
    return `0x${num.toString(16)}`;
}

/** Convert a IPv4 address like 1.2.3.4 to a number. */
export function ipv4ToNumber(ipv4: string): number {
    const bytes = ipv4.split(".");
    let result = 0;
    result += Number(bytes[0]) << 24;
    result += Number(bytes[1]) << 16;
    result += Number(bytes[2]) << 8;
    result += Number(bytes[3]);
    console.log("ipv4ToNumber", ipv4, result);
    return result;
}

/** Convert a IPv6 address like 2001:db8::2:1 to a BigInt. */
export function ipv6ToNumber(ipv6: string): bigint {
    const normalised = normaliseIpv6(ipv6);
    const groups = normalised.split(":");
    let result = 0n;
    result += BigInt(`0x${groups[0]}`) << 112n;
    result += BigInt(`0x${groups[1]}`) << 96n;
    result += BigInt(`0x${groups[2]}`) << 80n;
    result += BigInt(`0x${groups[3]}`) << 64n;
    result += BigInt(`0x${groups[4]}`) << 48n;
    result += BigInt(`0x${groups[5]}`) << 32n;
    result += BigInt(`0x${groups[6]}`) << 16n;
    result += BigInt(`0x${groups[7]}`);
    return result;
}

/** Convert a IPv6 address like 2001:db8::2:1 to a Uint16Array. */
export function ipv6ToBytes(ipv6: string): Uint16Array {
    const normalised = normaliseIpv6(ipv6);
    const groups = normalised.split(":");
    const result = new Uint16Array(8);
    const view = new DataView(result.buffer);

    let i = 0;
    for (const group of groups) {
        const num = parseInt(group, 16);
        view.setUint16(i, num, true);
        i += 2;
    }
    console.log("ipv6ToBytes", ipv6, result);
    return result;
}

/**
 * Normalise a IPv6 address so that `::` are replaced with zeros.
 */
export function normaliseIpv6(ipv6: string): string {
    if (ipv6.indexOf("::") < 0) return ipv6;

    // Use :: as the pivot and split into left and right.
    const parts = ipv6.split("::");
    const leftParts = parts[0].length === 0 ? [] : parts[0].split(":");
    const rightParts = parts[1].length === 0 ? [] : parts[1].split(":");

    // Work out how many zero-groups were collapsed in :: by counting length of
    // the left and right parts, then create the missing groups.
    const missingZeros = 8 - (leftParts.length + rightParts.length);
    const newZeros = [];
    for (let i = 0; i < missingZeros; i++) {
        newZeros.push("0");
    }
    return [...leftParts, ...newZeros, ...rightParts].join(":");
}

/** DNS Record Types. */
export enum DNSRecordType {
    UNKNOWN = 0,
    A = 1, // IPv4 address record
    AAAA = 28, // IPv6 address record
    CNAME = 5, // Canonical name record
    PTR = 12, // Pointer to a canonical name
}

/**
 * An abstract class that contains a resource record.
 *
 * Classes that extend this class must provide a `Payload` that will be added to
 * this resource record when the `Bytes` are generated.
 *
 * See https://tools.ietf.org/html/rfc1035#section-4.1.3 for details.
 */
export abstract class ResourceRecord {
    constructor(
        readonly Name = "",
        readonly NameParts: string[] = [],
        readonly RecordType = DNSRecordType.UNKNOWN,
        readonly RecordClass = DNSRecordClass.UNKNOWN,
        readonly TTL = 0,
    ) {}

    /** Get the bytes for this resource record. */
    get Bytes(): Uint8Array {
        const common = new Uint8Array(this.Name.length + 10);
        let view = new DataView(common.buffer);

        let index = 0;
        for (const part of this.NameParts) {
            view.setUint8(index, part.length);
            for (let i = 0; i < part.length; i++) {
                view.setUint8(index + 1 + i, part.charCodeAt(i));
            }
            index = index + 1 + part.length;
        }

        view.setUint16(index += 1, this.RecordType);
        view.setUint16(index += 2, this.RecordClass);
        view.setUint32(index += 2, this.TTL);

        const payload = this.Payload;
        const result = new Uint8Array(common.length + 2 + payload.length);
        result.set(common, 0);
        view = new DataView(result.buffer);

        view.setUint16(index += 4, payload.length);
        result.set(payload, index += 2);

        return result;
    }

    /** Get the payload for this resource record. */
    abstract get Payload(): Uint8Array;
    abstract get ReadableAddress(): string;
}

/** A Resource Record for 'A' record types. */
export class AResourceRecord extends ResourceRecord {
    ReadableAddress = "";

    /** The IPv4 address (as a number). */
    Address = 0;

    /** Returns the IPv4 address as an unsigned 32 bit int. */
    get Payload(): Uint8Array {
        const result = new Uint8Array(4);
        const view = new DataView(result.buffer);

        view.setUint32(0, this.Address);
        return result;
    }
    constructor(
        name: string,
        nameParts: string[],
        recordType: DNSRecordType,
        recordClass: DNSRecordClass,
        ttl: number,
        address: number,
        ReadableAddress: string,
    ) {
        super(name, nameParts, recordType, recordClass, ttl);
        this.Address = address;
        this.ReadableAddress = ReadableAddress;
    }
}

/** A Resource Record for 'AAAA' record types. */
export class AAAAResourceRecord extends ResourceRecord {
    ReadableAddress = "";
    /** The IPv6 address */
    Address: Uint16Array = Uint16Array.from([]);

    /** Returns the IPv6 address as Uint8Array */
    get Payload(): Uint8Array {
        const result = new Uint8Array(16);
        const inView = new DataView(this.Address.buffer);
        const outView = new DataView(result.buffer);

        for (let i = 0; i < 16; i += 2) {
            outView.setUint16(i, inView.getUint16(i), true);
        }
        return result;
    }
    constructor(
        name: string,
        nameParts: string[],
        recordType: DNSRecordType,
        recordClass: DNSRecordClass,
        ttl: number,
        address: Uint16Array,
        ReadableAddress: string,
    ) {
        super(name, nameParts, recordType, recordClass, ttl);
        this.Address = address;
        this.ReadableAddress = ReadableAddress;
    }
}

/** A Resource Record for CNAMEs. */
// export class CNameResourceRecord extends ResourceRecord {
//     /** The CNAME alias. */
//     CName = "";

//     get Payload(): Uint8Array {
//         const result = new Uint8Array(this.CName.length + 2);
//         const view = new DataView(result.buffer);

//         let index = 0;
//         for (const part of this.CName.split(".")) {
//             view.setUint8(index, part.length);
//             for (let i = 0; i < part.length; i++) {
//                 view.setUint8(index + 1 + i, part.charCodeAt(i));
//             }
//             index = index + 1 + part.length;
//         }

//         return result;
//     }
// }
export enum DNSRecordClass {
    UNKNOWN = 0,
    IN = 1, // Internet
    // Ignore Chaosnet and Hesiod stuff from the 1980s...
}
/** A Resource Record for TXT. */
// export class TxtResourceRecord extends ResourceRecord {
//     /** The TXT value. */
//     Txt = "";

//     get Payload(): Uint8Array {
//         const result = new Uint8Array(this.Txt.length);
//         const view = new DataView(result.buffer);

//         for (let i = 0; i < this.Txt.length; i++) {
//             view.setUint8(i, this.Txt.charCodeAt(i));
//         }
//         return result;
//     }
// }
/** A DNS Packet's Question. */
export class DNSQuestion {
    /** The human-friendly name */
    Name = "";
    /** The separate parts of the name. */
    NameParts: string[] = [];
    /** The Record Type (e.g. A, AAAA etc). */
    RecordType = 0;
    /** The Record Class - typically only IN. */
    RecordClass = 0;

    constructor(name = "", type = DNSRecordType.A, cls = DNSRecordClass.IN) {
        if (name === "") return;

        this.Name = name;
        this.NameParts = name.split(".");
        this.RecordType = type;
        this.RecordClass = cls;
    }

    public toString() {
        const recordType = DNSRecordType[this.RecordType];
        const recordClass = DNSRecordClass[this.RecordClass];
        return `Name: ${this.Name} Type: ${recordType} Class: ${recordClass}`;
    }

    /** Get the protocol bytes for the question. */
    get Bytes(): Uint8Array {
        const result = new Uint8Array(this.Name.length + 6);
        const view = new DataView(result.buffer);

        let index = 0;
        for (const part of this.NameParts) {
            view.setUint8(index, part.length);
            for (let i = 0; i < part.length; i++) {
                view.setUint8(index + 1 + i, part.charCodeAt(i));
            }
            index = index + 1 + part.length;
        }

        view.setUint16(index += 1, this.RecordType);
        view.setUint16(index += 2, this.RecordClass);
        return result;
    }

    /** Parse the DNS question out of the raw packet bytes. */
    static Parse(data: DataView): DNSQuestion {
        const question = new DNSQuestion();

        let index = 12; // DNS header is always 12 bytes

        // Questions always contain the name split into separate parts, with a
        // leading byte per part indicating its length. A 0x00 byte indicates the
        // end of the name section.
        //
        // E.g. www.example.com ends up as:
        //  Size  Name Part
        //  0x03  www
        //  0x07  example
        //  0x03  com
        //  0x00
        let length = data.getUint8(index);
        while (length != 0) {
            const labelPart = new Uint8Array(data.buffer, index + 1, length);
            const labelPartString = String.fromCharCode.apply(
                null,
                Array.from(labelPart),
            );
            question.NameParts.push(labelPartString);
            index += length + 1;
            length = data.getUint8(index);
        }

        question.Name = question.NameParts.join(".");
        question.RecordType = data.getUint16(index += 1);
        question.RecordClass = data.getUint16(index += 2);
        return question;
    }
}

export interface DNSConfig {
    [key: string]: DNSConfigRecord;
}

export interface DNSConfigRecord {
    ttl: number;
    class: {
        [key: string]: DNSConfigRecordClass;
    };
}
export interface DNSConfigRecordClass {
    [key: string]: string;
}
