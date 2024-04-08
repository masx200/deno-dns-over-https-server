import { JSONSTRINGIFYNULL4 } from "./JSONSTRINGIFYNULL4.ts";
import { hex } from "./hex.ts";

export class DNSHeader {
    Identification = 0;
    Flags = 0;
    TotalQuestions = 0;
    TotalAnswers = 0;
    TotalAuthorityResourceRecords = 0;
    TotalAdditionalResourceRecords = 0;
    // 添加 setqr 方法来设置 Query/Response (QR) 标志位
    setqr(isResponse: boolean) {
        if (isResponse) {
            this.Flags |= 0b1000000000000000; // 设置最高位为 1 表示响应
        } else {
            this.Flags &= 0b0111111111111111; // 清除最高位为 0 表示查询
        }
    }
    get QR(): number {
        return (this.Flags >> 15) & 1;
    } // 添加 setra 方法来设置 Recursion Available (RA) 标志位
    setra(recursionAvailable: boolean) {
        const raFlagBit = 7; // RA 标志位在 Flags 字段中的位置
        const raFlagMask = 1 << raFlagBit;

        if (recursionAvailable) {
            this.Flags |= raFlagMask; // 设置 RA 标志为 1
        } else {
            this.Flags &= ~raFlagMask; // 清除 RA 标志为 0
        }
    }

    // 添加 getra 方法来获取 Recursion Available (RA) 标志位的值
    getra(): number {
        return (this.Flags >> 7) & 1;
    }
    public toString(): string {
        return JSONSTRINGIFYNULL4({
            Identification: hex(this.Identification),
            Flags: hex(this.Flags),
            "Total Questions": hex(this.TotalQuestions),
            "Total Answers": hex(this.TotalAnswers),
            "Total Auth RR": hex(this.TotalAuthorityResourceRecords),
            "Total Additional RR": hex(this.TotalAdditionalResourceRecords),
        });
    }

    /** Get the protocol bytes for the header. */
    get Bytes(): Uint8Array {
        const result = new Uint8Array(12);
        const view = new DataView(result.buffer);

        view.setUint16(0, this.Identification);
        view.setUint16(2, this.Flags);

        view.setUint16(4, this.TotalQuestions);
        view.setUint16(6, this.TotalAnswers);

        view.setUint16(8, this.TotalAuthorityResourceRecords);
        view.setUint16(10, this.TotalAdditionalResourceRecords);

        return result;
    }

    /** Parse the DNS header out of the raw packet bytes. */
    static Parse(data: DataView): DNSHeader {
        const header = new DNSHeader();
        header.Identification = data.getInt16(0);
        header.Flags = data.getInt16(2);
        header.TotalQuestions = data.getInt16(4);
        header.TotalAnswers = data.getInt16(6);
        header.TotalAuthorityResourceRecords = data.getInt16(8);
        header.TotalAdditionalResourceRecords = data.getInt16(10);
        return header;
    }
}
