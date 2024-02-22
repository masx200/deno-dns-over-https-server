/** A Resource Record for CNAMEs. */
// export class CNameResourceRecord extends ResourceRecord {
//     /** The CNAME alias. */
//     CName = "";
//     get Payload(): Uint8Array {
//         const result = new Uint8Array(this.CName.length + 2);
//         const view = new DataView(result.buffer);
//         let index = 0;
//         for (const part of this.CName.split(".")) {
//             view.setUint8(index, part.length);
//             for (let i = 0; i < part.length; i++) {
//                 view.setUint8(index + 1 + i, part.charCodeAt(i));
//             }
//             index = index + 1 + part.length;
//         }
//         return result;
//     }
// }

export enum DNSRecordClass {
    UNKNOWN = 0,
    IN = 1,
}
