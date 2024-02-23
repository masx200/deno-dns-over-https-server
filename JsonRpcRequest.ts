export interface JsonRpcRequest<
    M extends (...args: any) => any,
> {
    jsonrpc: string;
    method: string;
    params?: Parameters<M>;
    id: number;
}
