import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { DDNScontentType } from "./DDNScontentType.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import {
    // Bson,
    Collection,
    Database,
    MongoClient,
} from "https://deno.land/x/mongo@v0.32.0/mod.ts";
export class DNSRecordsMongodb implements DNSRecordsInterface {
    #mongodb_url: string;
    #mongodb_db: string;
    #mongodb_collection: string;
    #client?: MongoClient;
    #db?: Database;
    #collection?: Collection<
        DDNScontentType
    >;
    constructor(
        mongodb_url: string,
        mongodb_db: string,
        mongodb_collection: string,
    ) {
        this.#mongodb_url = mongodb_url;
        this.#mongodb_db = mongodb_db;
        this.#mongodb_collection = mongodb_collection;
    }
    async get_collection() {
        if (this.#collection) return this.#collection;
        const client = new MongoClient();
        this.#client = client;
        await client.connect(this.#mongodb_url);
        const db = client.database(this.#mongodb_db);
        const collection = db.collection<DDNScontentType>(
            this.#mongodb_collection,
        );
        this.#db = db;
        this.#collection = collection;
        return {
            collection: this.#collection,
            db: this.#db,
            client: this.#client,
        };
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
if (import.meta.main) {
    const [mongodb_url, mongodb_db, mongodb_collection] = Deno.args;
    const dnsRecordsMongodb = new DNSRecordsMongodb(
        mongodb_url,
        mongodb_db,
        mongodb_collection,
    );
    console.log(dnsRecordsMongodb);
    console.log(await dnsRecordsMongodb.get_collection());
}
