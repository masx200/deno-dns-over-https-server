import config from "./config.ts";
import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { DNSRecordsMemory } from "./DNSRecordsMemory.ts";

export const dNSRecordsInstance: DNSRecordsInterface = new DNSRecordsMemory(
    config,
);
