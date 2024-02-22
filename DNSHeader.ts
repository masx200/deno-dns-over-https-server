import { JSONSTRINGIFYNULL4 } from "./JSONSTRINGIFYNULL4.ts";
import { hex } from "./hex.ts";

export class DNSHeader {
    Identification = 0;
    Flags = 0;
    TotalQuestions = 0;
    TotalAnswers = 0;
    TotalAuthorityResourceRecords = 0;
    TotalAdditionalResourceRecords = 0;
    get QR(): number {
        return (this.Flags >> 15) & 1;
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
