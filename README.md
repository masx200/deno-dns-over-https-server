# deno-dns-over-https-server

deno-dns-over-https-server

### 使用方法

将需要反向代理的 dns over https 网址设定为环境变量 doh,

将需要反向代理的最小缓存时间设定为环境变量 ttl,

启动

```
npx -y cross-env "doh=https://dns.alidns.com/dns-query" 'ttl=180' token=token deno run --unstable -A ./main.tsx
```

访问`http://localhost:8000/dns-query`使用 dns over https

也可以设置`doh`环境变量为一个`json`数组,使用负载均衡

例如设置 `doh`为
`["https://doh.pub/dns-query","https://security.cloudflare-dns.com/dns-query"]`

### 说明

配置文件为`config.ts`,可以使用内存中保存的 dns 记录,

数据保存方式可以访问数据库,配置环境变量
`mongodb_url`,`mongodb_db`,`mongodb_collection`

设置域名与地址的映射关系即可,支持多个地址

接口格式为`JSONRPC` 2.0

访问`http://localhost:8000/dns_records`使用 ddns

设置`token`环境变量为访问秘钥 `token` 即可使用 ddns

访问时需要携带`token`参数,例如

添加请求头`Authorization:Bearer token`

openapi 接口在文件`deno-dns-over-https-server.openapi.json`中

jsonrpc 接口在文件`DNSRecordsInterface.ts`中
