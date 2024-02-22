import { DNSRecordType } from "./DNSRecordType.ts";
import { DNSRecordClass } from "./DNSRecordClass.ts";

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
        return `{Name: ${this.Name}, Type: ${recordType} ,Class: ${recordClass}}`;
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
