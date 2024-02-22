import config from "./config.ts";
import { DNSRecordsInterface } from "./ddns_address_interface.ts";
import { DNSRecordsMemory } from "./DNSRecordsMemory.ts";

export const dNSRecordsInstance: DNSRecordsInterface = new DNSRecordsMemory(
    config,
);
