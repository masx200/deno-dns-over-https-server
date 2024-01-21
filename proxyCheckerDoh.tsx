export function proxyCheckerDoh(pathname: string, doh: string | undefined) {
    return pathname === "/dns-query" && doh?.startsWith("https://");
}
