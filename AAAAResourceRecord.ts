import { DNSRecordType } from "./DNSRecordType.ts";
import { ResourceRecord } from "./ResourceRecord.ts";
import { DNSRecordClass } from "./DNSRecordClass.ts";

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
