#!/usr/bin/env deno run --allow-read --allow-net --allow-env

import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

interface DNSRecord {
    name: string;
    content: string;
    type: string;
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
使用方法: deno run --allow-read --allow-net import-hosts-simple.ts [选项]

选项:
  --mongodb_url <url>        MongoDB 连接 URL (必需)
  --mongodb_db <db>          MongoDB 数据库名称 (必需)
  --mongodb_collection <col> MongoDB 集合名称 (必需)
  --file <path>              hosts 文件路径 (默认: hosts.log)
  --help                     显示此帮助信息

示例:
  deno run --allow-read --allow-net import-hosts-simple.ts \\
    --mongodb_url "mongodb://localhost:27017" \\
    --mongodb_db "dns_db" \\
    --mongodb_collection "dns_records"

  deno run --allow-read --allow-net import-hosts-simple.ts \\
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

        return records.filter((record) =>
            record.name && record.content && record.type
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

async function importViaRESTAPI(
    records: DNSRecord[],
    mongodbUrl: string,
    dbName: string,
    collectionName: string,
) {
    console.log("注意：由于 MongoDB 驱动兼容性问题，打印准备导入的记录...");
    console.log(`MongoDB URL: ${mongodbUrl}`);
    console.log(`Database: ${dbName}`);
    console.log(`Collection: ${collectionName}`);
    console.log(`Records count: ${records.length}`);

    // 将记录输出到文件，以便后续导入
    const outputFile = `dns_records_${Date.now()}.json`;
    await Deno.writeTextFile(outputFile, JSON.stringify(records, null, 2));
    console.log(`\n记录已保存到: ${outputFile}`);

    // 可以使用 MongoDB Compass 或命令行工具导入这个文件
    console.log("\n可以使用以下命令导入到 MongoDB:");
    console.log(
        `mongoimport --uri="${mongodbUrl}" --db="${dbName}" --collection="${collectionName}" --file="${outputFile}" --jsonArray`,
    );
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
            "请提供 --mongodb_url, --mongodb_db, 和 --mongodb_collection",
        );
        console.error("\n使用 --help 查看详细使用说明");
        Deno.exit(1);
    }

    const filePath = args.file || "hosts.log";

    try {
        console.log(`读取文件: ${filePath}`);
        const records = await parseHostsFile(filePath);
        console.log(`成功解析 ${records.length} 条 DNS 记录`);

        await importViaRESTAPI(
            records,
            args.mongodb_url!,
            args.mongodb_db!,
            args.mongodb_collection!,
        );

        console.log("\n✅ 准备完成！");
    } catch (error) {
        console.error(
            "\n❌ 处理失败:",
            error instanceof Error ? error.message : String(error),
        );
        Deno.exit(1);
    }
}

if (import.meta.main) {
    await main();
}
