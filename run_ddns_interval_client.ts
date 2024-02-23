// if (import.meta.main) {
//     console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());
// }
// console.log(await getAllTailscaleNetworkIPsAndSelfPublicIPs());

export function run_ddns_interval_client(
    opts: {
        interval: number;
        ipv4: boolean;
        ipv6: boolean;
        tailscal: boolean;
        public: boolean;
        token: string;
        name: string;
        service_url: string;
    },
): () => void {
    const timer = setInterval(async () => {
    }, opts.interval);
    return () => clearInterval(timer);
}
