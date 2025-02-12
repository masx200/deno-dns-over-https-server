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
deno run -A getHostEntry.ts >hosts.log
```
