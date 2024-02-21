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
// console.log(JSON.stringify({ Packet });
import {
    isIPv4,
    isIPv6,
} from "https://deno.land/std@0.169.0/node/internal/net.ts";
import Buffer from "npm:buffer@6.0.3";
// console.log(JSON.stringify({ Buffer });

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
            const packet: DNSPACKETWITHQUESTION = Packet.parse(
                Buffer.Buffer.from(data as Uint8Array),
            );
            const { success, result } = reply_dns_query(packet, data);

            if (success && result) {
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
            //     JSON.stringify({ request: { packet, data: data } }, null, 4),
            // );
        } else if (
            ctx.request.method === "POST" &&
            req.headers.get("content-type") === "application/dns-message"
        ) {
            const body = req.body && (await bodyToBuffer(req.body));
            req.body = body;

            if (body?.length) {
                const packet: DNSPACKETWITHQUESTION = Packet.parse(
                    Buffer.Buffer.from(body as Uint8Array),
                );
                const { success, result } = reply_dns_query(
                    packet,
                    body as Uint8Array,
                );

                if (success && result) {
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
                //     JSON.stringify(
                //         { request: { packet, data: body } },
                //         null,
                //         4,
                //     ),
                // );
                // console.log();
                // console.log(JSON.stringify({ packet });
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
        //         //     JSON.stringify(
        //         //         { response: { packet, data: resbody } },
        //         //         null,
        //         //         4,
        //         //     ),
        //         // );
        //         // console.log(JSON.stringify({ resbody });

        //         // console.log(JSON.stringify({ packet });
        //     }
        // }
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
export function reply_dns_query(
    packet: DNSPACKETWITHQUESTION,
    data: Uint8Array,
): { success: boolean; result: Uint8Array | null | undefined } {
    const name = packet.question[0]?.name;
    const address: string[] | undefined = config[name];

    if (address?.length && name) {
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
export class DNSHeader {
    Identification = 0;
    Flags = 0;
    TotalQuestions = 0;
    TotalAnswers = 0;
    TotalAuthorityResourceRecords = 0;
    TotalAdditionalResourceRecords = 0;

    public toString(): string {
        return `
        Identification: ${hex(this.Identification)}
                 Flags: ${hex(this.Flags)}
       Total Questions: ${hex(this.TotalQuestions)}
         Total Answers: ${hex(this.TotalAnswers)}
         Total Auth RR: ${hex(this.TotalAuthorityResourceRecords)}
   Total Additional RR: ${hex(this.TotalAdditionalResourceRecords)}`;
    }

    /** Get the protocol bytes for the header. */
    get Bytes(): Uint8Array {
        const result = new Uint8Array(12);
        const view = new DataView(result.buffer);

        view.setUint16(0, this.Identification);
        view.setUint16(2, this.Flags);

        view.setUint16(4, this.TotalQuestions);
        view.setUint16(6, this.TotalAnswers);

        view.setUint16(8, this.TotalAuthorityResourceRecords);
        view.setUint16(10, this.TotalAdditionalResourceRecords);

        return result;
    }

    /** Parse the DNS header out of the raw packet bytes. */
    static Parse(data: DataView): DNSHeader {
        const header = new DNSHeader();
        header.Identification = data.getInt16(0);
        header.Flags = data.getInt16(2);
        header.TotalQuestions = data.getInt16(4);
        header.TotalAnswers = data.getInt16(6);
        header.TotalAuthorityResourceRecords = data.getInt16(8);
        header.TotalAdditionalResourceRecords = data.getInt16(10);
        return header;
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
}

/** A Resource Record for 'A' record types. */
export class AResourceRecord extends ResourceRecord {
    /** The IPv4 address (as a number). */
    Address = 0;

    /** Returns the IPv4 address as an unsigned 32 bit int. */
    get Payload(): Uint8Array {
        const result = new Uint8Array(4);
        const view = new DataView(result.buffer);

        view.setUint32(0, this.Address);
        return result;
    }
}

/** A Resource Record for 'AAAA' record types. */
export class AAAAResourceRecord extends ResourceRecord {
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

/** Represents a DNS packet. */
export class DNSPacket {
    /** Copy of the raw data. */
    private rawData!: Uint8Array;

    /** Data view onto the raw data. */
    private data!: DataView;

    /** Private copy of the header. */
    private header!: DNSHeader;

    /** Private copy of the question. */
    private question!: DNSQuestion;

    /** Private copy of the answer (there may not be an answer). */
    private answers: ResourceRecord[] = [];

    /** Get the header for this packet. */
    get Header(): DNSHeader {
        return this.header;
    }

    /** Get the question for this packet. */
    get Question(): DNSQuestion {
        return this.question;
    }

    /** Sets the question for this packet. */
    set Question(question: DNSQuestion) {
        this.question = question;
        this.Header.TotalQuestions++;
    }

    /** Get the answer for this packet, if available. */
    get Answers(): ResourceRecord[] {
        return this.answers;
    }

    /** Sets the answer for this packet. */
    set Answers(answers: ResourceRecord[]) {
        this.answers = answers;
        this.Header.TotalAnswers++;
    }

    /**
     * Get the protocol bytes for this packet. Set any packet fields before
     * calling.
     */
    get Bytes(): Uint8Array {
        const header = this.Header?.Bytes;
        const question = this.Question?.Bytes;

        if (!header || !question) {
            console.warn(
                "Potentially invalid DNSPacket - missing header or question section",
            );
            return new Uint8Array();
        }

        const parts = [header, question];
        let length = header.length + question.length;
        for (const answer of this.Answers) {
            const bytes = answer.Bytes;
            length += bytes.length;
            parts.push(bytes);
        }

        const result = new Uint8Array(length);

        let offset = 0;
        for (const array of parts) {
            result.set(array, offset);
            offset += array.length;
        }
        return result;
    }

    constructor() {
        this.header = new DNSHeader();
        this.question = new DNSQuestion();
    }

    /**
     * Construct a new DNSPacket from the provided UInt8Array byte array. Use this to convert
     * data from the network into a DNSPacket.
     */
    static fromBytes(data: Uint8Array): DNSPacket {
        const packet = new DNSPacket();
        packet.rawData = data;
        packet.data = new DataView(data.buffer);

        packet.header = DNSHeader.Parse(packet.data);
        packet.question = DNSQuestion.Parse(packet.data);

        return packet;
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

/** A simple DNS Server. */
export class DNSServer {
    /**
     * Creates a new DNSServer.
     *
     * @param records The records that should be served by this server.
     */
    constructor(private readonly records: DNSConfig) {}
    /**
     * Handles a raw DNS request. Request payload should be the raw datagram
     * content.
     *
     * Returns the raw bytes for a DNS response to the request.
     */
    public HandleRequest(request: Uint8Array): Uint8Array {
        const packet = DNSPacket.fromBytes(request);
        //  const header = packet.Header;
        const question = packet.Question;

        const records: DNSConfig[] = [];
        try {
            // Special handling for A records: if we don't have an A record, check to
            // see if we have a CNAME for it, then get the A record for the CNAME
            // destination if we do.
            //
            // This is special processing only for CNAMEs - see the RFC for details:
            // https://tools.ietf.org/html/rfc1034#section-3.6.2
            if (
                question.RecordType == DNSRecordType.A ||
                question.RecordType == DNSRecordType.AAAA
            ) {
                // This was an A/AAAA record request and we *don't* have an A/AAA record
                // then handle the CNAME special case.
                if (!this.hasRecord(question.Name, question.RecordType)) {
                    // No A/AAAA record found for this name - look for a CNAME instead.
                    /*  let cnameRecord = this.getRecord(
                        question.Name,
                        DNSRecordType.CNAME,
                    );
                    if (cnameRecord) {
                        // We have a CNAME - add it to the response and then see if we have
                        // an A/AAAA for the CNAME's destination.
                        records.push(cnameRecord);
                        const key = Object.keys(cnameRecord)[0]; // This feels wrong?
                        const cnameDestination = cnameRecord[key]
                            .class[DNSRecordClass[question.RecordClass]][
                                DNSRecordType[DNSRecordType.CNAME]
                            ];
                        if (
                            this.hasRecord(
                                cnameDestination,
                                question.RecordType,
                            )
                        ) {
                            // Yes we have a A/AAAA for this CNAME dest - add it to response.
                            records.push(
                                this.getRecord(
                                    cnameDestination,
                                    question.RecordType,
                                ),
                            );
                        }
                    } */
                } else {
                    // A/AAAA was found - just add that to the response.
                    records.push(
                        this.getRecord(question.Name, question.RecordType),
                    );
                }
            } else {
                // Not an A record request - carry on as usual.
                records.push(
                    this.getRecord(question.Name, question.RecordType),
                );
            }
        } catch (error) {
            console.error(`Error handling request: ${error}`);
            return request;
        }

        // console.log(`Serving request: ${packet.Question}`);
        packet.Header.Flags = 32768; // 0x8000
        for (const record of records) {
            const rrType = this.getResourceRecordType(packet.Question, record);
            if (rrType) packet.Answers.push(rrType);
        }
        packet.Header.TotalAnswers = packet.Answers.length;
        return new Uint8Array(packet.Bytes);
    }

    /**
     * Checks for a config record by name, type, and optionally class (class
     * defaults to `IN` if not set).
     */
    private hasRecord(
        name: string,
        recordType: DNSRecordType,
        recordClass: DNSRecordClass = DNSRecordClass.IN,
    ): boolean {
        const config = this.records[name];
        if (!config) return false;
        if (!config.class[DNSRecordClass[recordClass]]) return false;
        if (
            !config
                .class[DNSRecordClass[recordClass]][DNSRecordType[recordType]]
        ) return false;
        return true;
    }

    /**
     * Get the config record by name, type, and optionally class (class defaults
     * to `IN` if not set).
     */
    private getRecord(
        name: string,
        recordType: DNSRecordType,
        recordClass: DNSRecordClass = DNSRecordClass.IN,
    ): DNSConfig {
        const config = this.records[name];

        if (!config) throw new Error(`No config for ${name}`);
        if (!config.class[DNSRecordClass[recordClass]]) {
            throw new Error(`No config for class '${recordClass}' for ${name}`);
        }
        if (
            !config
                .class[DNSRecordClass[recordClass]][DNSRecordType[recordType]]
        ) console.warn(`No config for type '${recordType}' for ${name}`);

        return { [name]: config };
    }

    /** Get an appropriate record type for the question using the config. */
    // TODO: refactor this whole thing - should be per-record, not relating to Question.
    // TODO: allow both A & AAAA to be returned at once.
    private getResourceRecordType(
        question: DNSQuestion,
        config: DNSConfig,
    ): ResourceRecord | undefined {
        const key = Object.keys(config)[0]; // This feels wrong?
        const classConfig =
            config[key].class[DNSRecordClass[question.RecordClass]];
        let rr: ResourceRecord | undefined;

        // TODO: make records strongly typed to avoid this mess
        if (
            Object.prototype.hasOwnProperty.call(
                classConfig,
                DNSRecordType[DNSRecordType.A],
            )
        ) {
            rr = new AResourceRecord(
                key,
                key.split("."),
                question.RecordType,
                question.RecordClass,
                config[key].ttl,
            );
            (rr as AResourceRecord).Address = ipv4ToNumber(
                classConfig[DNSRecordType[DNSRecordType.A]],
            );
        } else if (
            Object.prototype.hasOwnProperty.call(
                classConfig,
                DNSRecordType[DNSRecordType.AAAA],
            )
        ) {
            rr = new AAAAResourceRecord(
                key,
                key.split("."),
                question.RecordType,
                question.RecordClass,
                config[key].ttl,
            );
            (rr as AAAAResourceRecord).Address = ipv6ToBytes(
                classConfig[DNSRecordType[DNSRecordType.AAAA]],
            );
        } /* else if (
            classConfig.hasOwnProperty(DNSRecordType[DNSRecordType.CNAME])
        ) {
            const name = classConfig[DNSRecordType[DNSRecordType.CNAME]];
            rr = new CNameResourceRecord(
                key,
                key.split("."),
                DNSRecordType.CNAME,
                question.RecordClass,
                config[key].ttl,
            );
            (rr as CNameResourceRecord).CName = name;
        } */

        return rr;
    }
}
