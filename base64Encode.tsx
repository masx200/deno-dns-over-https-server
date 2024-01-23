/**
 * 将给定的Uint8Array类型的数据进行Base64编码
 * @param byteArray - 要进行编码的Uint8Array类型的数据
 * @returns 编码后的Base64字符串
 */
export function base64Encode(byteArray: Uint8Array): string {
    const buffer = new Uint8Array(byteArray);
    const binaryString = buffer.reduce(
        (str, byte) => str + String.fromCharCode(byte),
        ""
    );
    const encoded = btoa(binaryString)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    return encoded;
}
