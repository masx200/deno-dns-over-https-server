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
} from "https://deno.land/x/mongo@v0.33.0/mod.ts";
// import config from "./config.ts";
export type DDNScontentTypeMongodb = Omit<
    DDNScontentType & {
        _id: ObjectId;
    },
    "id"
>;

export class DNSRecordsMongodb implements DNSRecordsInterface {
    #mongodb_url: string;
    #mongodb_db: string;
    #mongodb_collection: string;
    #client?: MongoClient;
    #db?: Database;
    #collection?: Collection<
        DDNScontentTypeMongodb
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
    async #get_collection() {
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
        const collection = db.collection<DDNScontentTypeMongodb>(
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
        const { collection } = await this.#get_collection();
        const dnsRecords = await collection.find({ ...options }).toArray();
        return dnsRecords.map((a) => ({ ...a, id: a._id.toString() }));
    }
    async CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]> {
        /* Error: MongoError: {"ok":0,"errmsg":"Write batch sizes must be between 1 and 100000. Got 0 operations.","code":16,"codeName":"InvalidLength","$clusterTime":{"clusterTime":{"$timestamp":"7338715695602991110"},"signature":{"hash":"ldVuq7C1qBkqombHL8Y0rtiF0y0=","keyId":{"low":4,"high":1699536178,"unsigned":false}}},"operationTime":{"$timestamp":"7338715695602991110"}} */
        if (!record.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        const dnsRecords = await collection.insertMany(record);
        return await this.DNSRecordDetails(
            dnsRecords.insertedIds.map((a) => ({ id: a.toString() })),
        );
    }
    async OverwriteDNSRecord(
        array: DDNScontentType[],
    ): Promise<DDNScontentType[]> {
        if (!array.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        await Promise.all(
            array.map(async (a) => {
                return await collection.updateOne(
                    { _id: new ObjectId(a.id) },
                    { $set: { ...a } },
                    { upsert: true },
                );
            }),
        );

        return await this.DNSRecordDetails(
            array.map((a) => ({ id: a.id.toString() })),
        );
    }
    async UpdateDNSRecord(
        array: (DDNScontentID & Partial<DDNScontentContent>)[],
    ): Promise<DDNScontentType[]> {
        if (!array.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        await Promise.all(
            array.map(async (a) => {
                return await collection.updateOne(
                    { _id: new ObjectId(a.id) },
                    { $set: { ...a } },
                    { upsert: false },
                );
            }),
        );

        return await this.DNSRecordDetails(
            array.map((a) => ({ id: a.id.toString() })),
        );
    }
    async DeleteDNSRecord(array: DDNScontentID[]): Promise<DDNScontentID[]> {
        if (!array.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        await collection.deleteMany({
            _id: { $in: array.map((a) => new ObjectId(a.id)) },
        });
        return array;
    }
    async DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]> {
        if (!array.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        const dnsRecords = await collection.find({
            _id: { $in: array.map((a) => new ObjectId(a.id)) },
        }).toArray();
        return dnsRecords.map((a) => ({ ...a, id: a._id.toString() }));
    }
}
// }
// if (import.meta.main) {
//     const [mongodb_url, mongodb_db, mongodb_collection] = Deno.args;
//     const dnsRecordsMongodb = new DNSRecordsMongodb(
//         mongodb_url,
//         mongodb_db,
//         mongodb_collection,
//     );
//     console.log(
//         "DNSRecordDetails",
//         await dnsRecordsMongodb.DNSRecordDetails([{
//             id: "65d8366f924c00407664ea6a",
//         }, {
//             id: "65d8366f924c00407664ea6a",
//         }]),
//     );
//     console.log(
//         "OverwriteDNSRecord",
//         await dnsRecordsMongodb.OverwriteDNSRecord([{
//             "id": "65d8366f924c00407664ea6a",

//             "name": "ssssss2222222222",
//             "type": "22222222A",
//             "content": "111111122222221",
//         }]),
//     );
//     console.log(
//         "DNSRecordDetails",
//         await dnsRecordsMongodb.DNSRecordDetails([{
//             id: "65d8366f924c00407664ea6a",
//         }, {
//             id: "65d8366f924c00407664ea6a",
//         }]),
//     );
//     // console.log(dnsRecordsMongodb);
//     // console.log("get_collection", await dnsRecordsMongodb.get_collection());
//     // console.log(
//     //     "ListDNSRecords",
//     //     await dnsRecordsMongodb.ListDNSRecords(),
//     // );
//     // console.log(
//     //     "ListDNSRecords",
//     //     await dnsRecordsMongodb.ListDNSRecords({
//     //         name: "ssssss",
//     //         type: "A",
//     //         content: "11111111",
//     //     }),
//     // );

//     // console.log(
//     //     "CreateDNSRecord",
//     //     await dnsRecordsMongodb.CreateDNSRecord([...config]),
//     // );
//     // console.log(
//     //     "DNSRecordDetails",
//     //     await dnsRecordsMongodb.DNSRecordDetails([{
//     //         id: "65d829c6924c00407664ea68",
//     //     }, { id: "65d82b60924c00407664ea69" }]),
//     // );
//     // console.log("ListDNSRecords", await dnsRecordsMongodb.ListDNSRecords());
//     // console.log(
//     //     "DNSRecordDetails",
//     //     await dnsRecordsMongodb.DNSRecordDetails([{
//     //         id: "65d82e558071304c2f37c4ce",
//     //     }, {
//     //         id: "65d82e558071304c2f37c4cd",
//     //     }]),
//     // );
//     // console.log(
//     //     "DeleteDNSRecord",
//     //     await dnsRecordsMongodb.DeleteDNSRecord([
//     //         {
//     //             id: "65d82e558071304c2f37c4ce",
//     //         },
//     //         {
//     //             id: "65d82e558071304c2f37c4cd",
//     //         },
//     //     ]),
//     // );
//     // console.log(
//     //     "DNSRecordDetails",
//     //     await dnsRecordsMongodb.DNSRecordDetails([{
//     //         id: "65d82e558071304c2f37c4ce",
//     //     }, {
//     //         id: "65d82e558071304c2f37c4cd",
//     //     }]),
//     // );
//     // console.log("ListDNSRecords", await dnsRecordsMongodb.ListDNSRecords());
// }
