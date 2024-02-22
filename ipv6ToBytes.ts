import { normaliseIpv6 } from "./normaliseIpv6.ts";

/** Convert a IPv6 address like 2001:db8::2:1 to a Uint16Array. */

export function ipv6ToBytes(ipv6: string): Uint16Array {
    const normalised = normaliseIpv6(ipv6);
    const groups = normalised.split(":");
    const result = new Uint16Array(8);
    const view = new DataView(result.buffer);

    let i = 0;
    for (const group of groups) {
        const num = parseInt(group, 16);
        view.setUint16(i, num, true);
        i += 2;
    }
    // console.log("ipv6ToBytes", ipv6, result);
    return result;
}
