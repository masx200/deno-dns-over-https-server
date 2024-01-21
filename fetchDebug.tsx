export async function fetchDebug(
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
): Promise<Response> {
    const request = new Request(input, init);
    const { url, method, headers } = request;
    console.log("request", {
        url,
        method,
        headers: Object.fromEntries(headers),
    });
    const response = await fetch(request);

    console.log("response", {
        url: request.url,
        status: response.status,
        method,
        headers: Object.fromEntries(response.headers),
    });
    return response;
}
