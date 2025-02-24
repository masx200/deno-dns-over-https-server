import { main } from "./dns_resolver.ts";

Deno.test("resolveDNSudp", async () => {
    await main();
});
