import config from "./config.ts";
import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { DNSRecordsMemory } from "./DNSRecordsMemory.ts";
import { DNSRecordsMongodb } from "./DNSRecordsMongodb.ts";
const mongodb_url = Deno.env.get("mongodb_url");
const mongodb_db = Deno.env.get("mongodb_db");
const mongodb_collection = Deno.env.get("mongodb_collection");
export const dNSRecordsInstance: DNSRecordsInterface =
    (mongodb_url && mongodb_db && mongodb_collection)
        ? new DNSRecordsMongodb(mongodb_url, mongodb_db, mongodb_collection)
        : new DNSRecordsMemory(
            config,
        );
