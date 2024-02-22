import { DNSRecordType } from "./DNSRecordType.ts";
import { ResourceRecord } from "./ResourceRecord.ts";
import { DNSRecordClass } from "./DNSRecordClass.ts";

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
