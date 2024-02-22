// deno-lint-ignore-file require-await
import config from "./config.ts";
import {
    DDNScontentContent,
    DDNScontentID,
    DDNScontentType,
    DNSRecordsInterface,
} from "./ddns_address_interface.ts";

import { createHash } from "node:crypto";
export class DNSRecordsMemory implements DNSRecordsInterface {
    async ListDNSRecords(
        options: Partial<
            {
                name?: string | undefined;
                content?: string | undefined;
                type: string;
            }
        >,
    ): Promise<DDNScontentType[]> {
        return config.filter((a) =>
            (options.type === undefined || a.type === options.type) &&
            (options.name === undefined || a.name === options.name) &&
            (options.content === undefined || a.content === options.content)
        ).map(function (a) {
            const key = a.name + a.type + a.content;
            const hash = createHash("sha512");
            hash.update(key);
            const filename = hash.digest("base64");

            return ({ ...a, id: filename });
        });
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
        array: DDNScontentType[],
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
