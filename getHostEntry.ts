/* 当然，我可以为你详细解释这段代码。以下是代码的逐行解释：

### 代码解释

```typescript
import hostile from "npm:hostile@1.4.0";
```
- 这行代码使用 `import` 语句从 NPM 包 `hostile` 的版本 `1.4.0` 导入 `hostile` 模块。`npm:hostile@1.4.0` 是 Deno 特有的语法，用于指定从 NPM 包中导入模块。

```typescript
export async function getHostEntry(domain: string): Promise<string[]> {
```
- 这行代码定义了一个异步函数 `getHostEntry`，该函数接受一个字符串参数 `domain`，表示要查询的域名。函数返回一个 `Promise`，解析后的值是一个包含 IP 地址的字符串数组。

```typescript
    try {
```
- 开始一个 `try` 块，用于捕获和处理可能出现的异常。

```typescript
        // 使用 hostile 获取指定域名的hosts条目
        const entry = await new Promise<string[]>((resolve, reject) => {
```
- 这行代码创建了一个新的 `Promise`，用于异步调用 `hostile.get` 方法。`Promise` 的解析值类型是 `string[]`，即一个包含 IP 地址的数组。

```typescript
            hostile.get(false, (err: Error, result: string[][]) => {
```
- 调用 `hostile.get` 方法，传入两个参数：
  - `false`：表示不刷新缓存。
  - 一个回调函数，该函数接受两个参数：`err`（错误对象）和 `result`（结果数组）。`result` 是一个二维数组，每个子数组包含一个 IP 地址和一个主机名。

```typescript
                if (err) {
                    reject(err);
                } else {
                    const addresses: string[] = [];
```
- 如果 `hostile.get` 调用失败，回调函数会接收到一个错误对象 `err`，此时调用 `reject` 方法，将错误传递给 `Promise`。
- 如果成功，创建一个空数组 `addresses`，用于存储与指定域名匹配的 IP 地址。

```typescript
                    for (const [IP, Host] of result) {
                        if (Host == domain && IP.length) {
                            addresses.push(IP);
                        }
                    }
```
- 遍历 `result` 数组，检查每个子数组中的主机名 `Host` 是否等于传入的 `domain`，并且 IP 地址不为空。如果条件满足，将 IP 地址添加到 `addresses` 数组中。

```typescript
                    resolve(addresses);
                }
            });
        });
```
- 如果成功找到与域名匹配的 IP 地址，调用 `resolve` 方法，将 `addresses` 数组作为解析值传递给 `Promise`。

```typescript
        return entry;
    } catch (error) {
        console.error(`Failed to get host entry for ${domain}:`, error);
        return [];
    }
}
```
- 返回 `entry`，即包含与域名匹配的 IP 地址的数组。
- 如果在 `try` 块中捕获到任何异常，打印错误信息，并返回一个空数组 `[]`。

### 总结

这段代码的主要功能是使用 `hostile` 包从本地的 hosts 文件中查找指定域名的 IP 地址，并返回一个包含这些 IP 地址的数组。通过使用 `Promise` 和 `async/await` 语法，代码变得更加简洁和易读。同时，通过 `try/catch` 块，代码能够优雅地处理可能出现的错误。 */
import { isIPv6 } from "https://deno.land/std@0.169.0/node/internal/net.ts";
import hostile from "npm:@masx200/hostile@1.4.1";

export async function getHostEntry(domain: string): Promise<string[]> {
    try {
        // 使用 hostile 获取指定域名的hosts条目
        const entry = await new Promise<string[]>((resolve, reject) => {
            hostile.get(false, (err: Error, result: string[][]) => {
                if (err) {
                    reject(err);
                } else {
                    const addresses: { name: string; content: string }[] =
                        parseHostEntries(result);
                    resolve(
                        addresses.filter((x) => x.name === domain)
                            .map((x) => x.content),
                    );
                }
            });
        });
        if (entry.length) {
            console.log("getHostEntry success", domain, entry);
            return entry;
        }
        console.error(`Failed to get host entry for ${domain}:`);
        return [];
    } catch (error) {
        console.error(`Failed to get host entry for ${domain}:`, error);
        return [];
    }
}
if (import.meta.main) {
    const entry = await new Promise<{ name: string; content: string }[]>(
        (resolve, reject) => {
            hostile.get(false, (err: Error, result: string[][]) => {
                if (err) {
                    reject(err);
                } else {
                    const addresses: { name: string; content: string }[] =
                        parseHostEntries(result);
                    resolve(addresses);
                }
            });
        },
    );

    console.log(
        JSON.stringify(
            entry.map((x) => {
                return {
                    name: x.name,
                    content: x.content,
                    type: isIPv6(x.content) ? "AAAA" : "A",
                };
            }),
            null,
            4,
        ),
    );
}

function parseHostEntries(result: string[][]) {
    const addresses: { name: string; content: string }[] = [];

    for (const [IP, Host] of result) {
        if (Host.length && IP.length) {
            if (Host.trim().length > 0 && IP.trim().length == 0) {
                const array = Host.trim()
                    .split(/ +/g)
                    .map((x) => x.trim());
                const content = array[0];
                const name = array[1];
                addresses.push({
                    content: content,
                    name: name,
                });
            } else {
                addresses.push({
                    content: IP.trim(),
                    name: Host.trim(),
                });
            }
        }
    }
    return addresses;
}
