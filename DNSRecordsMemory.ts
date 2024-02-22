// deno-lint-ignore-file require-await
import { DNSRecordsInterface } from "./DNSRecordsInterface.ts";
import { DDNScontentType } from "./DDNScontentType.ts";
import { DDNScontentID } from "./DDNScontentID.ts";
import { DDNScontentContent } from "./DDNScontentContent.ts";
// @deno-types="npm:@types/node@20.11.19/crypto.d.ts"
import crypto from "node:crypto";
const { createHash } = crypto; // 引入crypto模块中的createHash方法
export class DNSRecordsMemory implements DNSRecordsInterface {
    // #config: DDNScontentContent[]; // 配置项：DDNScontentContent数组
    #map: Map<string, DDNScontentType> = new Map(); // 记录DDNS内容的Map对象
    constructor(config: DDNScontentContent[] = []) {
        // this.#config = config; // 配置项赋值
        this.#map = new Map(
            config.map((a) => {
                const id = this.#hashDDNScontentContent(a); // 生成DDNS内容的唯一ID
                return [id, { ...a, id: id }]; // 将ID添加到DDNS内容对象中
            }),
        );
    }

    // 获取满足条件的DNS记录列表
    async ListDNSRecords(
        options: Partial<
            {
                name?: string | undefined; // DNS记录名称
                content?: string | undefined; // DNS记录内容
                type: string; // DNS记录类型
            }
        > = {},
    ): Promise<DDNScontentType[]> {
        return Array.from(this.#map.values()).filter((a) => {
            if (options.name && a.name !== options.name) return false;
            if (options.content && a.content !== options.content) return false;
            if (options.type && a.type !== options.type) return false;
            return true;
        });
    }

    // 生成DDNS内容的唯一ID
    #hashDDNScontentContent(a: DDNScontentContent) {
        const key = a.name + a.type + a.content; // 生成用于计算哈希值的字符串
        const hash = createHash("sha512"); // 创建SHA-512哈希对象
        hash.update(key); // 更新哈希对象
        const filename = hash.digest("base64"); // 计算哈希值并转换为Base64编码
        return filename; // 返回唯一ID
    }

    // 创建DNS记录
    async CreateDNSRecord(
        record: DDNScontentContent[],
    ): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (
            const a of record
        ) {
            const id = this.#hashDDNScontentContent(a); // 生成唯一ID
            this.#map.set(id, { ...a, id: id }); // 将ID添加到DDNS内容对象中
            res.push({ ...a, id: id }); // 将ID添加到返回的DNS记录对象中
        }
        return res;
    }

    // 替换DNS记录
    async OverwriteDNSRecord(
        array: DDNScontentType[],
    ): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (
            const a of array
        ) {
            const id = a.id; // 获取唯一ID
            this.#map.set(id, { ...a, id: id }); // 将ID添加到DDNS内容对象中
            res.push({ ...a, id: id }); // 将ID添加到返回的DNS记录对象中
        }
        return res;
    }

    // 更新DNS记录
    async UpdateDNSRecord(
        array: (DDNScontentID & Partial<DDNScontentContent>)[],
    ): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (
            const a of array
        ) {
            const id = a.id; // 获取唯一ID
            const record = Object.assign({}, this.#map.get(a.id), {
                ...a,
                id: id,
            }); // 获取并更新DDNS内容对象
            this.#map.set(id, record); // 将ID添加到DDNS内容对象中
            res.push(record); // 将更新后的DNS记录对象添加到返回结果中
        }
        return res;
    }

    // 删除DNS记录
    async DeleteDNSRecord(array: DDNScontentID[]): Promise<DDNScontentID[]> {
        for (const a of array) {
            this.#map.delete(a.id); // 删除指定ID的DNS记录
        }
        return array;
    }

    // 获取DNS记录详情
    async DNSRecordDetails(array: DDNScontentID[]): Promise<DDNScontentType[]> {
        const res: DDNScontentType[] = [];
        for (const a of array) {
            const r = this.#map.get(a.id); // 获取指定ID的DNS记录
            if (r) res.push(r); // 将DNS记录对象添加到返回结果中
        }
        return res;
    }
}
