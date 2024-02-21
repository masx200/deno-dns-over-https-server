import { DNSConfigRecord } from "./DNSConfigRecord.ts";

export interface DNSConfig {
    [key: string]: DNSConfigRecord;
}
