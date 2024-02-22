import { normaliseIpv6 } from "./normaliseIpv6.ts";

/** Convert a IPv6 address like 2001:db8::2:1 to a BigInt. */

export function ipv6ToNumber(ipv6: string): bigint {
    const normalised = normaliseIpv6(ipv6);
    const groups = normalised.split(":");
    let result = 0n;
    result += BigInt(`0x${groups[0]}`) << 112n;
    result += BigInt(`0x${groups[1]}`) << 96n;
    result += BigInt(`0x${groups[2]}`) << 80n;
    result += BigInt(`0x${groups[3]}`) << 64n;
    result += BigInt(`0x${groups[4]}`) << 48n;
    result += BigInt(`0x${groups[5]}`) << 32n;
    result += BigInt(`0x${groups[6]}`) << 16n;
    result += BigInt(`0x${groups[7]}`);
    return result;
}
