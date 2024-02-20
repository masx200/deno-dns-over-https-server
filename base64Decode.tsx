/**
 * 将给定的Base64字符串进行解码
 * @param base64String - 要进行解码的Base64字符串
 * @returns 解码后的Uint8Array类型的数据
 */
export function base64Decode(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    const binaryString = atob(base64);
    const buffer = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        buffer[i] = binaryString.charCodeAt(i);
    }

    return buffer;
}
