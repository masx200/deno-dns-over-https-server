import Packet from "npm:native-dns-packet@0.1.1";
import Buffer from "npm:buffer@6.0.3";
import { JSONSTRINGIFYNULL4 } from "./JSONSTRINGIFYNULL4.ts";
import { DNSPACKET, DNSQuestion, ResourceRecord } from "./resolve_dns_query.ts";
import { DNSHeader } from "./DNSHeader.ts";

/** Represents a DNS packet. */

export class DNSPacket {
    toString(): string {
        return JSONSTRINGIFYNULL4(this, null, 4);
    }
    /** Copy of the raw data. */
    public rawData!: Uint8Array;

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
        console.log("DNSPacket.Bytes", JSONSTRINGIFYNULL4(this, null, 4));
        /* 这个编码有问题,换个dns编码器 */
        const packet: DNSPACKET = Packet.parse(this.rawData);
        packet.header.qr = this.Header.QR;
        for (const answer of this.Answers) {
            packet.answer.push({
                name: answer.Name,
                type: answer.RecordType,
                class: answer.RecordClass,
                ttl: answer.TTL,
                address: answer.ReadableAddress,
            });
        }
        const buff = new Buffer.Buffer(10960);
        const written = Packet.write(buff, packet);
        return buff.slice(0, written);
        // const header = this.Header?.Bytes;
        // const question = this.Question?.Bytes;
        // if (!header || !question) {
        //     console.warn(
        //         "Potentially invalid DNSPacket - missing header or question section",
        //     );
        //     return new Uint8Array();
        // }
        // const parts = [header, question];
        // let length = header.length + question.length;
        // for (const answer of this.Answers) {
        //     const bytes = answer.Bytes;
        //     length += bytes.length;
        //     parts.push(bytes);
        // }
        // const result = new Uint8Array(length);
        // let offset = 0;
        // for (const array of parts) {
        //     result.set(array, offset);
        //     offset += array.length;
        // }
        // return result;
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
