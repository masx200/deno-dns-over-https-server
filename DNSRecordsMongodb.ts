import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { DDNScontentType } from "./DDNScontentType.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import {
    // Bson,
    Collection,
    Database,
    MongoClient,
    ObjectId,
} from "https://deno.land/x/mongo@v0.32.0/mod.ts";
export class DNSRecordsMongodb implements DNSRecordsInterface {
    #mongodb_url: string;
    #mongodb_db: string;
    #mongodb_collection: string;
    #client?: MongoClient;
    #db?: Database;
    #collection?: Collection<
        DDNScontentType & { _id: ObjectId }
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
        if (this.#collection && this.#db && this.#client) {
            return {
                collection: this.#collection,
                db: this.#db,
                client: this.#client,
            };
        }
        const client = new MongoClient();
        this.#client = client;
        await client.connect(this.#mongodb_url);
        const db = client.database(this.#mongodb_db);
        const collection = db.collection<DDNScontentType & { _id: ObjectId }>(
            this.#mongodb_collection,
        );
        this.#db = db;
        this.#collection = collection;
        await collection.createIndexes({
            indexes: [
                { key: { name: 1 }, name: "name_1" },
                { key: { type: 1 }, name: "type_1" },
                { key: { content: 1 }, name: "content_1" },
            ],
        });
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
        const { collection } = await this.get_collection();
        const dnsRecords = await collection.find({ ...options }).toArray();
        return dnsRecords.map((a) => ({ ...a, id: a._id.toString() }));
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
    console.log(
        await dnsRecordsMongodb.ListDNSRecords(),
    );
    console.log(
        await dnsRecordsMongodb.ListDNSRecords({
            name: "ssssss",
            type: "A",
            content: "11111111",
        }),
    );
}
