export interface DNSInterceptorOptions extends
    Array<{
        suffix: string;
        url: string | string[];
    }> {}
