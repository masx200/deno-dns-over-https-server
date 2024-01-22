export function get_path_name(url: string): string {
    const pathname = new URL(url).pathname;
    return pathname;
}
