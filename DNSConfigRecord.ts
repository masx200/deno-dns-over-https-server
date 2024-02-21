import { DNSConfigRecordClass } from "./DNSConfigRecordClass.ts";

export interface DNSConfigRecord {
    ttl: number;
    class: {
        [key: string]: DNSConfigRecordClass;
    };
}
