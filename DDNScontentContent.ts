export type DDNScontentContent = {
    /**DNS record name (or @ for the zone apex) in Punycode. */
    name: string;
    /**A valid IPv4 address. */
    content: string;
    /**Record type. */
    type: string;
};
