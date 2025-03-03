import { DNSPACKETWITHANSWER } from "./DNSPACKETWITHANSWER.ts";
import { DNSPACKETWITHQUESTION } from "./DNSPACKETWITHQUESTION.ts";

export type DNSPACKETInterface =
    & DNSPACKETWITHANSWER
    & DNSPACKETWITHQUESTION
    & {
        header: {
            id: number;
            qr: number;
            opcode: number;
            aa: number;
            tc: number;
            rd: number;
            ra: number;
            res1: number;
            res2: number;
            res3: number;
            rcode: number;
        };
    }
    & {
        authority: any[];
        additional: any[];
    };
