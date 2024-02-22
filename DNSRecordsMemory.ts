// deno-lint-ignore-file require-await
// import config from "./config.ts";
import {
    DDNScontentContent,
    DDNScontentID,
    DDNScontentType,
    DNSRecordsInterface,
} from "./ddns_address_interface.ts";

import { createHash } from "node:crypto";
export class DNSRecordsMemory implements DNSRecordsInterface {
    // #config: DDNScontentContent[];
    #map: Map<string, DDNScontentType> = new Map();
    constructor(config: DDNScontentContent[] = []) {
        // this.#config = config;
        this.#map = new Map(
            config.map((a) => {
                const id = this.#hashDDNScontentContent(a);
                return [id, { ...a, id: id }];
            }),
        );
    }

    async ListDNSRecords(
        options: Partial<
            {
                name?: string | undefined;
                content?: string | undefined;
                type: string;
            }
        >,
    ): Promise<DDNScontentType[]> {
        return Array.from(this.#map.values()).filter((a) => {
            if (options.name && a.name !== options.name) return false;
            if (options.content && a.content !== options.content) return false;
            if (options.type && a.type !== options.type) return false;
            return true;
        });
    }

    #hashDDNScontentContent(a: DDNScontentContent) {
        const key = a.name + a.type + a.content;
        const hash = createHash("sha512");
        hash.update(key);
        const filename = hash.digest("base64");
        return filename;
    }

    async CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (
            const a of record
        ) {
            const id = this.#hashDDNScontentContent(a);
            this.#map.set(id, { ...a, id: id });
            res.push({ ...a, id: id });
        }
        return res;
    }
    async OverwriteDNSRecord(
        array: DDNScontentType[],
    ): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (
            const a of array
        ) {
            const id = a.id;
            this.#map.set(id, { ...a, id: id });
            res.push({ ...a, id: id });
        }
        return res;
    }
    async UpdateDNSRecord(
        array: (DDNScontentID & Partial<DDNScontentContent>)[],
    ): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (
            const a of array
        ) {
            const id = a.id;
            const record = Object.assign({}, this.#map.get(a.id), {
                ...a,
                id: id,
            });
            this.#map.set(id, record);
            res.push(record);
        }
        return res;
    }
    async DeleteDNSRecord(array: DDNScontentID[]): Promise<DDNScontentID[]> {
        for (const a of array) {
            this.#map.delete(a.id);
        }
        return array;
    }
    async DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (const a of array) {
            const r = this.#map.get(a.id);
            if (r) res.push(r);
        }
        return res;
    }
}
