/** Convert a IPv4 address like 1.2.3.4 to a number. */

export function ipv4ToNumber(ipv4: string): number {
    const bytes = ipv4.split(".");
    let result = 0;
    result += Number(bytes[0]) << 24;
    result += Number(bytes[1]) << 16;
    result += Number(bytes[2]) << 8;
    result += Number(bytes[3]);
    // console.log("ipv4ToNumber", ipv4, result);
    return result;
}
