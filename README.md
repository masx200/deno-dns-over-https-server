# deno-dns-over-https-server

deno-dns-over-https-server

### 使用方法

将需要反向代理的 dns over https 网址设定为环境变量 `doh`,

将需要反向代理的最小缓存时间(秒)设定为环境变量 `ttl`,

启动

```
npx -y cross-env "doh=https://dns.alidns.com/dns-query" 'ttl=180' token=token deno run --unstable -A ./main.tsx
```

访问`http://localhost:8000/dns-query`使用 dns over https

也可以设置`doh`环境变量为一个`json`数组,使用负载均衡

例如设置 `doh`为
`["https://doh.pub/dns-query","https://security.cloudflare-dns.com/dns-query"]`

添加了负载均衡的故障转移功能和校验 dns 数据包格式的功能

设置 doh 服务的路径通过环境变量`DOH_PATHNAME`为 "/dns-query"

### 环境变量

| 环境变量 | 说明 | 类型 | | -------------------------- |
----------------------------------------------------- |
---------------------------------- | ------------------ | | `doh` | 上游 dns
over https 网址 | `string` 或 `string[]`(JSON) | | `ttl` | 最小缓存时间(秒) |
`number` | | `DOH_PATHNAME` | 这个 dns over https 服务的路径 | `string` | |
`token` | dns 记录管理的秘钥 | `string` | | `mongodb_url` | mongodb 数据库地址 |
`string` | | `mongodb_db` | mongodb 数据库名称 | `string` | |
`mongodb_collection` | mongodb 数据库集合名称 | `string` | | `DNS_INTERCEPTOR` |
拦截 dns 请求的参数数组 |
`Array<{suffix: string;url: string | string[];}>`(JSON) | |
`DNS_INTERCEPTOR`.`url` | 上游服务器 url 支持 udp 和 tcp 协议和 http/https 协议
| `string` 或 `string[]` | | `DNS_INTERCEPTOR`.`suffix` | suffix
是域名后缀,开头不包含"." | `string` |

### dns 记录说明

为了 dns 负载均衡,可以对 dns 记录随机排序

dns 记录默认保存在内存中,配置文件为`config.ts`,

数据保存方式可以使用`mongodb`数据库,

配置环境变量`mongodb_url`,`mongodb_db`,`mongodb_collection`

设置域名与地址的映射关系即可,支持多个地址

接口格式为`JSONRPC` 2.0

访问`http://localhost:8000/dns_records`使用 ddns

设置`token`环境变量为访问秘钥 `token` 即可使用 ddns

访问时需要携带`token`参数,例如

添加请求头`Authorization:Bearer token`

openapi 接口在文件`deno-dns-over-https-server.openapi.json`中

jsonrpc 接口在文件`DNSRecordsInterface.ts`中

可以使用客户端 deno-ddns-over-https-client 进行访问 ddns 服务

`jsonrpc`的调用的例子在文件夹`dns_records`中

## 删除 deno deploy 上的 kv 数据

设置环境变量`DENO_KV_ACCESS_TOKEN=****************************************`

```sh
npx -y cross-env  "DENO_KV_ACCESS_TOKEN=****************************************" deno repl -A --unstable-kv
```

```ts
var kv = await Deno.openKv(
    "https://api.deno.com/databases/************************************/connect",
);
for await (const entry of kv.list({ prefix: [] })) {
    console.log(entry);
    kv.delete(entry.key).then(console.log, console.error);
}
```

## 导出所有本地的系统 hosts 文件为 json 格式

```shell
deno cache -I getHostEntry.ts
deno run -A getHostEntry.ts >hosts.log
```
