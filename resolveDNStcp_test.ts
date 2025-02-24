import { main } from "./dns_resolver-tcp.ts";

Deno.test("resolveDNStcp", async () => {
    await main();
});
