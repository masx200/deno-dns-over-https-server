import { JsonRpcRequest } from "./JsonRpcRequest.ts";

export async function JSONRPCCLIENT<
    T extends Record<any, (...args: any) => any>,
    M extends keyof T,
>(
    service_url: string,
    token: string,
    method: M,
    params: Parameters<T[M]>,
): Promise<ReturnType<T[M]>[]> {
    const request: JsonRpcRequest<T[M]> = {
        jsonrpc: "2.0",
        method: method as string,
        params: params,
        id: Date.now(),
    };
    console.log({ request });
    const reqinit = new Request(service_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
    console.log({ request: reqinit });
    const response = await fetch(
        reqinit,
    );
    console.log({ request: reqinit, response });
    if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log({ response: data, request });
    const rpcResponse = data as JsonRpcResponse<T[M]>;

    if ("result" in rpcResponse && rpcResponse.result) {
        return rpcResponse.result;
    } else if ("error" in rpcResponse && rpcResponse.error) {
        throw new Error(rpcResponse.error.message);
    }

    throw new Error("Invalid JSON-RPC response");
}
export interface JsonRpcResponse<
    M extends (...args: any) => any,
> {
    jsonrpc: string;
    result?: ReturnType<M>;
    error?: {
        code: number;
        message: string;
    };
}
