import { DDNScontentContent } from "./DDNScontentContent.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentType } from "./DDNScontentType.ts";

// 缓存Promise接口

export type DNSRecordsInterface = {
    /**List, search, sort, and filter a zones' DNS records. */
    ListDNSRecords(
        options?: Partial<{ name?: string; content?: string; type: string }>,
    ): Promise<DDNScontentType[]>;
    /**Create a new DNS record for a zone.

Notes:

A/AAAA records cannot exist on the same name as CNAME records.
NS records cannot exist on the same name as any other record type.
Domain names are always represented in Punycode, even if Unicode characters were used when creating the record. */
    CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]>;
    /**Overwrite an existing DNS record. Notes:

A/AAAA records cannot exist on the same name as CNAME records.
NS records cannot exist on the same name as any other record type.
Domain names are always represented in Punycode, even if Unicode characters were used when creating the record. */
    OverwriteDNSRecord(array: DDNScontentType[]): Promise<DDNScontentType[]>;
    /** Update an existing DNS record. Notes:

A/AAAA records cannot exist on the same name as CNAME records.
NS records cannot exist on the same name as any other record type.
Domain names are always represented in Punycode, even if Unicode characters were used when creating the record. */
    UpdateDNSRecord(
        array: (DDNScontentID & Partial<DDNScontentContent>)[],
    ): Promise<DDNScontentType[]>;
    /**Delete DNS Record  */
    DeleteDNSRecord(array: DDNScontentID[]): Promise<DDNScontentID[]>;
    /**DNS Record Details */
    DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]>;
};
