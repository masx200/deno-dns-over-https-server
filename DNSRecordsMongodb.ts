/* 这段代码定义了一个名为 `DNSRecordsMongodb` 的类，它实现了 `DNSRecordsInterface` 接口。这个类的主要功能是与 MongoDB 数据库进行交互，以执行动态域名系统（Dynamic DNS，简称 DDNS）记录的创建、读取、更新和删除（CRUD）操作。

### 依赖导入
- `DNSRecordsInterface`：从 `"./DNSRecordsInterface.ts"` 导入，这是一个接口，定义了 `DNSRecordsMongodb` 类需要实现的方法。
- `DDNScontentType`、`DDNScontentID` 和 `DDNScontentContent`：从相应的文件中导入，它们可能是用于描述 DDNS 记录的数据结构或类型。
- `mongoose`：一个对象数据映射器（ODM），用于管理应用程序与 MongoDB 之间的交互。

### 类型定义
- `DDNScontentTypeMongodb`：这是 `DDNScontentType` 类型的一个变体，其中添加了 `_id` 字段（MongoDB 文档的唯一标识符），并移除了 `id` 字段（可能是因为 MongoDB 自动为每个文档生成了一个 `_id`）。

### 构造函数
- 接受三个参数：`mongodb_url`（MongoDB 连接字符串）、`mongodb_db`（数据库名称）和 `mongodb_collection`（集合名称）。
- 初始化私有属性，这些属性将用于连接到 MongoDB 并与之交互。

### 方法
- `#get_collection`：这是一个私有的异步方法，用于获取 MongoDB 集合的引用。如果集合已经被加载，则直接返回；否则，它会连接到 MongoDB，并根据提供的模式定义创建集合。
- `ListDNSRecords`：查询数据库中的 DNS 记录，支持通过选项参数进行筛选。
- `CreateDNSRecord`：向数据库中插入新的 DNS 记录。
- `OverwriteDNSRecord`：用新数据覆盖现有的 DNS 记录，如果记录不存在则创建。
- `UpdateDNSRecord`：更新已存在的 DNS 记录的部分字段。
- `DeleteDNSRecord`：从数据库中删除指定的 DNS 记录。
- `DNSRecordDetails`：根据给定的 ID 列表查询具体的 DNS 记录详情。

### 模式定义
- `BlogPostschema`：虽然这个名字暗示它可能用于博客文章，但在这个上下文中，它实际上定义了 DNS 记录在 MongoDB 中的存储格式。它包括 `_id`（文档的唯一标识符）、`name`、`content` 和 `type` 字段。

### 注释掉的代码
- 代码中包含了一些被注释掉的部分，这可能是为了调试目的或者是因为某些功能暂时不需要使用。例如，一些 MongoDB 客户端的初始化代码被注释掉了，这表明可能已经选择了使用 `mongoose` 而不是直接使用 MongoDB 客户端。

### 总结
`DNSRecordsMongodb` 类提供了一套完整的工具来管理和操作 MongoDB 中的 DDNS 记录。它遵循了标准的 CRUD 操作模式，并且通过使用 Mongoose，使得与 MongoDB 的交互更加方便和类型安全。 */
import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { DDNScontentType } from "./DDNScontentType.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentContent } from "./DDNScontentContent.ts";
import mongoose, {
    // Bson,
    // Collection,
    Model,
    // Database,
    // MongoClient,
    ObjectId,
    Schema,
} from "mongoose";
// import config from "./config.ts";
export type DDNScontentTypeMongodb = Omit<
    DDNScontentType & {
        _id: ObjectId;
    },
    "id"
>;

const DDNSBlogPostschema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    content: String,
    type: String,
});
export class DNSRecordsMongodb implements DNSRecordsInterface {
    #mongodb_url: string;
    #mongodb_db: string;
    #mongodb_collection: string;
    // #client?: MongoClient;
    // #db?: Database;
    #collection?: Model<
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
    async #get_collection(): Promise<
        { collection: mongoose.Model<DDNScontentTypeMongodb> }
    > {
        if (this.#collection /* && this.#db && this.#client */) {
            return {
                collection: this.#collection,
                // db: this.#db,
                // client: this.#client,
            };
        }
        const client = await mongoose.connect(this.#mongodb_url, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,

            dbName: this.#mongodb_db,
        });
        // console.log(client);
        // const client = new MongoClient();
        // this.#client = client;
        // await client.connect(this.#mongodb_url);
        // const db = client.database(this.#mongodb_db);
        DDNSBlogPostschema.index({ name: 1 });
        DDNSBlogPostschema.index({ type: 1 });
        DDNSBlogPostschema.index({ content: 1 });
        const collection = client.model<DDNScontentTypeMongodb>(
            this.#mongodb_collection,
            DDNSBlogPostschema,
            this.#mongodb_collection,
        );
        // this.#db = db;

        this.#collection = collection;
        // console.log(collection);
        // await collection.createIndexes({
        //     indexes: [
        //         { key: { name: 1 }, name: "name_1" },
        //         { key: { type: 1 }, name: "type_1" },
        //         { key: { content: 1 }, name: "content_1" },
        //     ],
        // });
        return {
            collection: this.#collection,
            // db: this.#db,
            // client: this.#client,
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
        const dnsRecords = await collection.find({ ...options }); //.toArray();
        return dnsRecords.map((a) => a.toObject()).map((a) => ({
            ...a,
            id: a._id.toString(),
        }));
    }
    async CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]> {
        /* Error: MongoError: {"ok":0,"errmsg":"Write batch sizes must be between 1 and 100000. Got 0 operations.","code":16,"codeName":"InvalidLength","$clusterTime":{"clusterTime":{"$timestamp":"7338715695602991110"},"signature":{"hash":"ldVuq7C1qBkqombHL8Y0rtiF0y0=","keyId":{"low":4,"high":1699536178,"unsigned":false}}},"operationTime":{"$timestamp":"7338715695602991110"}} */
        if (!record.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        const Localdata = record.map((a) =>
            new collection({ ...a, _id: new mongoose.Types.ObjectId() })
        );
        console.log("CreateDNSRecord", Localdata);
        const insertedDocs = await collection.insertMany(
            Localdata,
        );
        // console.log("CreateDNSRecord", insertedDocs);
        const datainserted = insertedDocs.map((doc) => doc.toObject()).map((
            a,
        ) => ({
            ...a,
            id: a._id.toString(),
        }));
        console.log("CreateDNSRecord", datainserted);
        return datainserted;
        // const insertedIds = insertedDocs.map((doc) => doc.toObject()._id);
        // return await this.DNSRecordDetails(
        //     insertedIds
        //         .map((a) => ({ id: a.toString() })),
        //     // .insertedIds.map((a) => ({ id: a.toString() })),
        // );
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
                    { _id: new mongoose.Types.ObjectId(a.id) },
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
                    { _id: new mongoose.Types.ObjectId(a.id) },
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
        /* Error: Internal error
CastError: Cast to ObjectId failed for value "SchemaObjectId  */
        const { collection } = await this.#get_collection();
        const objectIds = array.map((a) => new mongoose.Types.ObjectId(a.id));
        await collection.deleteMany({
            _id: { $in: objectIds },
        });
        return array;
    }
    async DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]> {
        if (!array.length) {
            return [];
        }
        const { collection } = await this.#get_collection();
        const dnsRecords = await collection.find({
            _id: { $in: array.map((a) => new mongoose.Types.ObjectId(a.id)) },
        }); //.toArray();
        return dnsRecords.map((a) => a.toObject()).map((a) => ({
            ...a,
            id: a._id.toString(),
        }));
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
