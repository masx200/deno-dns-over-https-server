import { DDNScontentContent } from "./DDNScontentContent.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentType } from "./DDNScontentType.ts";
import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { JSONRPCCLIENT } from "./JSONRPCCLIENT.ts";
export class DNSRecordsRemoteJSONRPC implements DNSRecordsInterface {
    #service_url: string;
    #token: string;
    constructor(service_url: string, token: string) {
        this.#service_url = service_url;
        this.#token = token;
    }
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
        return await JSONRPCCLIENT(
            this.#service_url,
            this.#token,
            "ListDNSRecords",
            [options],
        );
    }
    async CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]> {
        return await JSONRPCCLIENT(
            this.#service_url,
            this.#token,
            "CreateDNSRecord",
            [record],
        );
    }
    async OverwriteDNSRecord(
        array: DDNScontentType[],
    ): Promise<DDNScontentType[]> {
        return await JSONRPCCLIENT(
            this.#service_url,
            this.#token,
            "OverwriteDNSRecord",
            [array],
        );
    }
    async UpdateDNSRecord(
        array: (DDNScontentID & Partial<DDNScontentContent>)[],
    ): Promise<DDNScontentType[]> {
        return await JSONRPCCLIENT(
            this.#service_url,
            this.#token,
            "UpdateDNSRecord",
            [array],
        );
    }
    async DeleteDNSRecord(array: DDNScontentID[]): Promise<DDNScontentID[]> {
        return await JSONRPCCLIENT(
            this.#service_url,
            this.#token,
            "DeleteDNSRecord",
            [array],
        );
    }
    async DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]> {
        return await JSONRPCCLIENT(
            this.#service_url,
            this.#token,
            "DNSRecordDetails",
            [array],
        );
    }
}
