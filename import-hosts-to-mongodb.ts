#!/usr/bin/env deno run --allow-read --allow-net --allow-env

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

interface DNSRecord {
    _id?: { toString(): string };
    name: string;
    content: string;
    type: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface Args {
    _: string[];
    mongodb_url?: string;
    mongodb_db?: string;
    mongodb_collection?: string;
    file?: string;
    help?: boolean;
}

function showHelp() {
    console.log(`
使用方法: deno run --allow-read --allow-net import-hosts-to-mongodb.ts [选项]

选项:
  --mongodb_url <url>        MongoDB 连接 URL (必需)
  --mongodb_db <db>          MongoDB 数据库名称 (必需)
  --mongodb_collection <col> MongoDB 集合名称 (必需)
  --file <path>              hosts 文件路径 (默认: hosts.log)
  --help                     显示此帮助信息

说明:
  该工具会智能合并DNS记录，基于域名+记录类型作为唯一标识：
  - 新增：如果记录不存在，直接插入
  - 合并：如果记录存在但IP不同，更新IP地址  
  - 跳过：如果记录完全相同，跳过处理

示例:
  deno run --allow-read --allow-net import-hosts-to-mongodb.ts \\
    --mongodb_url "mongodb://localhost:27017" \\
    --mongodb_db "dns_db" \\
    --mongodb_collection "dns_records"

  deno run --allow-read --allow-net import-hosts-to-mongodb.ts \\
    --mongodb_url "mongodb://user:pass@host:port" \\
    --mongodb_db "dns_db" \\
    --mongodb_collection "dns_records" \\
    --file "custom_hosts.log"
`);
}

async function parseHostsFile(filePath: string): Promise<DNSRecord[]> {
    try {
        const content = await Deno.readTextFile(filePath);
        const records: DNSRecord[] = JSON.parse(content);

        if (!Array.isArray(records)) {
            throw new Error("文件格式错误：期望一个数组");
        }

        // 验证每条记录的格式
        for (const record of records) {
            if (!record.name || !record.content || !record.type) {
                console.warn(`警告：跳过无效记录 ${JSON.stringify(record)}`);
                continue;
            }
        }

        return records.filter(
            (record) => record.name && record.content && record.type
        );
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            throw new Error(`文件不存在: ${filePath}`);
        }
        if (error instanceof SyntaxError) {
            throw new Error(`JSON 格式错误: ${error.message}`);
        }
        throw error;
    }
}

async function importToMongoDB(
    records: DNSRecord[],
    mongodbUrl: string,
    dbName: string,
    collectionName: string
) {
    const client = new MongoClient();

    try {
        console.log("连接到 MongoDB...");
        await client.connect(mongodbUrl);

        const db = client.database(dbName);
        const collection = db.collection<DNSRecord>(collectionName);

        console.log(`准备合并 ${records.length} 条记录...`);

        // 批量处理，每批最多 1000 条
        const batchSize = 1000;
        let insertedCount = 0;
        let mergedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);

            for (const record of batch) {
                // 检查是否已存在相同的记录（name + type 组合）

                for await (const existing of collection.find({
                    name: record.name,
                    type: record.type,
                }))
                    if (existing) {
                        if (existing.content !== record.content) {
                            // 记录存在但内容不同，进行合并更新
                            console.log(
                                await collection.updateMany(
                                    { _id: existing._id },
                                    {
                                        $set: {
                                            content: record.content,
                                            updatedAt: new Date(),
                                        },
                                        $setOnInsert: {
                                            createdAt:
                                                existing.createdAt ||
                                                new Date(),
                                        },
                                    }
                                )
                            );
                            console.log(
                                `合并记录: ${record.name} (${record.type}) ${existing.content} -> ${record.content}`
                            );
                            mergedCount++;
                        } else {
                            // 记录完全相同，跳过
                            console.log(
                                `跳过相同记录: ${record.name} (${record.type})`
                            );
                            skippedCount++;
                        }
                    } else {
                        // 记录不存在，插入新记录
                        await collection.insertOne({
                            ...record,
                            createdAt: new Date(),
                        });
                        insertedCount++;
                    }
            }

            console.log(
                `已处理 ${Math.min(i + batchSize, records.length)}/${
                    records.length
                } 条记录...`
            );
        }

        console.log(`\n合并完成！`);
        console.log(`- 新增记录: ${insertedCount}`);
        console.log(`- 合并更新记录: ${mergedCount}`);
        console.log(`- 跳过相同记录: ${skippedCount}`);
        console.log(`- 总处理记录数: ${records.length}`);

        // 显示集合统计信息
        const totalCount = await collection.countDocuments({});
        console.log(`\n集合 "${collectionName}" 总记录数: ${totalCount}`);
    } catch (error) {
        console.error(
            "MongoDB 操作失败:",
            error instanceof Error ? error.message : String(error)
        );
        throw error;
    } finally {
        await client.close();
        console.log("MongoDB 连接已关闭");
    }
}

async function main() {
    const args: Args = parse(Deno.args);

    if (args.help) {
        showHelp();
        Deno.exit(0);
    }

    // 检查必需参数
    if (!args.mongodb_url || !args.mongodb_db || !args.mongodb_collection) {
        console.error("错误: 缺少必需参数");
        console.error(
            "请提供 --mongodb_url, --mongodb_db, 和 --mongodb_collection"
        );
        console.error("\n使用 --help 查看详细使用说明");
        Deno.exit(1);
    }

    const filePath = args.file || "hosts.log";

    try {
        console.log(`读取文件: ${filePath}`);
        const records = await parseHostsFile(filePath);
        console.log(`成功解析 ${records.length} 条 DNS 记录`);

        await importToMongoDB(
            records,
            args.mongodb_url!,
            args.mongodb_db!,
            args.mongodb_collection!
        );

        console.log("\n✅ 导入成功完成！");
    } catch (error) {
        console.error(
            "\n❌ 导入失败:",
            error instanceof Error ? error.message : String(error)
        );
        Deno.exit(1);
    }
}

if (import.meta.main) {
    await main();
}
