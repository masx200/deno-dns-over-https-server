import { DNSRecordType } from "./DNSRecordType.ts";
import { DNSRecordClass } from "./DNSRecordClass.ts";

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
