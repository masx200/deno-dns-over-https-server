export function get_doh_url() {
    return Deno.env.get("doh");
}
