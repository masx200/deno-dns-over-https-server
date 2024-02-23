import { DDNScontentContent } from "./DDNScontentContent.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentType } from "./DDNScontentType.ts";
import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";

export class DNSRecordsRemoteJSONRPC implements DNSRecordsInterface {
    constructor() {}
    async ListDNSRecords(
        options?:
            | Partial<
                {
                    name?: string | undefined;
                    content?: string | undefined;
                    type: string;
                }
            >
            | undefined,
    ): Promise<DDNScontentType[]> {
        throw new Error("Method not implemented.");
    }
    async CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]> {
        throw new Error("Method not implemented.");
    }
    async OverwriteDNSRecord(
        array: DDNScontentType[],
    ): Promise<DDNScontentType[]> {
        throw new Error("Method not implemented.");
    }
    async UpdateDNSRecord(
        array: (DDNScontentID & Partial<DDNScontentContent>)[],
    ): Promise<DDNScontentType[]> {
        throw new Error("Method not implemented.");
    }
    async DeleteDNSRecord(array: DDNScontentID[]): Promise<DDNScontentID[]> {
        throw new Error("Method not implemented.");
    }
    async DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]> {
        throw new Error("Method not implemented.");
    }
}
